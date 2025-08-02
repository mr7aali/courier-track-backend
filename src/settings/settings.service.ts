import { Injectable, NotFoundException } from "@nestjs/common"
import type { Model } from "mongoose"
import type { Setting, SettingDocument } from "./schemas/setting.schema"
import type { CreateSettingDto } from "./dto/create-setting.dto"
import type { UpdateSettingDto } from "./dto/update-setting.dto"

@Injectable()
export class SettingsService {
  constructor(private settingModel: Model<SettingDocument>) {
    this.initializeDefaultSettings()
  }

  async create(createSettingDto: CreateSettingDto): Promise<Setting> {
    const setting = new this.settingModel(createSettingDto)
    return setting.save()
  }

  async findAll(category?: string, isPublic?: boolean) {
    const query: any = {}

    if (category) {
      query.category = category
    }

    if (isPublic !== undefined) {
      query.isPublic = isPublic
    }

    return this.settingModel.find(query).exec()
  }

  async findOne(key: string): Promise<Setting> {
    const setting = await this.settingModel.findOne({ key }).exec()
    if (!setting) {
      throw new NotFoundException(`Setting with key '${key}' not found`)
    }
    return setting
  }

  async update(key: string, updateSettingDto: UpdateSettingDto): Promise<Setting> {
    const setting = await this.settingModel.findOneAndUpdate({ key }, updateSettingDto, { new: true }).exec()

    if (!setting) {
      throw new NotFoundException(`Setting with key '${key}' not found`)
    }
    return setting
  }

  async remove(key: string): Promise<void> {
    const result = await this.settingModel.findOneAndDelete({ key }).exec()
    if (!result) {
      throw new NotFoundException(`Setting with key '${key}' not found`)
    }
  }

  async getValue(key: string): Promise<any> {
    const setting = await this.findOne(key)

    switch (setting.type) {
      case "number":
        return Number.parseFloat(setting.value)
      case "boolean":
        return setting.value === "true"
      case "json":
        return JSON.parse(setting.value)
      default:
        return setting.value
    }
  }

  async setValue(key: string, value: any): Promise<Setting> {
    let stringValue: string

    if (typeof value === "object") {
      stringValue = JSON.stringify(value)
    } else {
      stringValue = String(value)
    }

    return this.update(key, { value: stringValue })
  }

  private async initializeDefaultSettings(): Promise<void> {
    const defaultSettings = [
      {
        key: "delivery_fee_per_km",
        value: "5",
        description: "Delivery fee per kilometer",
        type: "number",
        category: "pricing",
        isPublic: true,
      },
      {
        key: "max_parcel_weight",
        value: "50",
        description: "Maximum parcel weight in kg",
        type: "number",
        category: "system",
        isPublic: true,
      },
      {
        key: "cod_fee_percentage",
        value: "2",
        description: "COD fee percentage",
        type: "number",
        category: "pricing",
        isPublic: true,
      },
      {
        key: "notification_email",
        value: "notifications@courier.com",
        description: "Email for system notifications",
        type: "string",
        category: "system",
        isPublic: false,
      },
      {
        key: "company_name",
        value: "Courier Express",
        description: "Company name",
        type: "string",
        category: "system",
        isPublic: true,
      },
      {
        key: "support_phone",
        value: "+1234567890",
        description: "Support phone number",
        type: "string",
        category: "system",
        isPublic: true,
      },
      {
        key: "working_hours",
        value: JSON.stringify({
          start: "09:00",
          end: "18:00",
          days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
        }),
        description: "Working hours configuration",
        type: "json",
        category: "system",
        isPublic: true,
      },
    ]

    for (const setting of defaultSettings) {
      const exists = await this.settingModel.findOne({ key: setting.key })
      if (!exists) {
        await this.create(setting)
      }
    }
  }
}
