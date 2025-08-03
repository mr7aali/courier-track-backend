
import { Injectable } from '@nestjs/common';
import { type Model, Types } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';
import type { CreateNotificationDto } from './dto/create-notification.dto';
import type { PaginationDto } from '../common/dto/pagination.dto';
import * as nodemailer from 'nodemailer';
import { Twilio } from 'twilio';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationsService {
  private emailTransporter: nodemailer.createTransport;
  private twilioClient: Twilio;


  constructor(@InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
private readonly configService: ConfigService
) {
    // Email configuration
    this.emailTransporter = nodemailer.createTransport({
      host: this.configService.get<string>("SMTP_HOST"),
      port: Number.parseInt(  this.configService.get<string>("SMTP_PORT") || '587'),
      secure: false,
      auth: {
        
        user: this.configService.get<string>("SMTP_USER"),
        pass:  this.configService.get<string>("SMTP_PASS"),
        
      },
    });

    // SMS configuration
    this.twilioClient = new Twilio(
      this.configService.get<string>("TWILIO_ACCOUNT_SID"),
      this.configService.get<string>("TWILIO_AUTH_TOKEN"),
    );
  }

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = new this.notificationModel({
      ...createNotificationDto,
      userId: new Types.ObjectId(createNotificationDto.userId),
    });

    const savedNotification = await notification.save();

    // Send notification based on type
    await this.sendNotification(savedNotification);

    return savedNotification;
  }

  async sendNotification(notification: NotificationDocument): Promise<void> {
    try {
      switch (notification.type) {
        case 'email':
          await this.sendEmail(notification);
          break;
        case 'sms':
          await this.sendSMS(notification);
          break;
        case 'push':
          await this.sendPushNotification(notification);
          break;
        case 'in_app':
          // In-app notifications are just stored in database
          break;
      }

      notification.status = 'sent';
      notification.sentAt = new Date();
      await notification.save();
    } catch (error) {
      notification.status = 'failed';
      notification.failureReason = error.message;
      await notification.save();
    }
  }

  private async sendEmail(notification: NotificationDocument): Promise<void> {
    const user = await notification.populate('userId', 'email name');

    await this.emailTransporter.sendMail({
      from: this.configService.get<string>("FROM_EMAIL"),
      to: (user.userId as any).email,
      subject: notification.title,
      html: notification.message,
    });
  }

  private async sendSMS(notification: NotificationDocument): Promise<void> {
    const user = await notification.populate('userId', 'phone');

    await this.twilioClient.messages.create({
      body: `${notification.title}: ${notification.message}`,
      from: this.configService.get<string>("TWILIO_PHONE_NUMBER"),
      to: (user.userId as any).phone,
    });
  }

  private async sendPushNotification(
    notification: NotificationDocument,
  ): Promise<void> {
    // Implement push notification logic here
    // You can use Firebase Cloud Messaging or similar service
    console.log('Push notification sent:', notification.title);
  }

  async findAll(paginationDto: PaginationDto, userId?: string) {
    const { page = 1, limit = 10, search, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * limit;

    let query = {};

    if (userId) {
      query = { userId: new Types.ObjectId(userId) };
    }

    if (search) {
      query = {
        ...query,
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { message: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort['createdAt'] = -1;
    }

    const [notifications, total] = await Promise.all([
      this.notificationModel
        .find(query)
        .populate('userId', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments(query),
    ]);

    return {
      notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markAsRead(id: string): Promise<Notification | null> {
    return this.notificationModel.findByIdAndUpdate(
      id,
      { isRead: true, readAt: new Date() },
      { new: true },
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      userId: new Types.ObjectId(userId),
      isRead: false,
    });
  }

  // Helper methods for common notifications
  async sendParcelStatusNotification(
    userId: string,
    trackingId: string,
    status: string,
  ): Promise<void> {
    const title = 'Parcel Status Update';
    const message = `Your parcel ${trackingId} status has been updated to: ${status}`;

    await this.create({
      userId,
      title,
      message,
      type: 'in_app',
      metadata: { trackingId, status },
    });

    // Also send email notification
    await this.create({
      userId,
      title,
      message,
      type: 'email',
      metadata: { trackingId, status },
    });
  }

  async sendDeliveryNotification(
    userId: string,
    trackingId: string,
  ): Promise<void> {
    const title = 'Parcel Delivered';
    const message = `Your parcel ${trackingId} has been successfully delivered!`;

    await this.create({
      userId,
      title,
      message,
      type: 'in_app',
      metadata: { trackingId },
    });

    await this.create({
      userId,
      title,
      message,
      type: 'sms',
      metadata: { trackingId },
    });
  }
}
