import { Injectable } from "@nestjs/common"
import type { Model } from "mongoose"
import type { ParcelDocument } from "../parcels/schemas/parcel.schema"
import type { PaymentDocument } from "../payments/schemas/payment.schema"
import type { UserDocument } from "../users/schemas/user.schema"
import type { AgentDocument } from "../agents/schemas/agent.schema"
import * as csvWriter from "csv-writer"
import * as PDFDocument from "pdfkit"
import type { Response } from "express"

@Injectable()
export class ReportsService {
  private parcelModel: Model<ParcelDocument>
  private paymentModel: Model<PaymentDocument>
  private userModel: Model<UserDocument>
  private agentModel: Model<AgentDocument>

  constructor(
    parcelModel: Model<ParcelDocument>,
    paymentModel: Model<PaymentDocument>,
    userModel: Model<UserDocument>,
    agentModel: Model<AgentDocument>,
  ) {
    this.parcelModel = parcelModel
    this.paymentModel = paymentModel
    this.userModel = userModel
    this.agentModel = agentModel
  }

  async generateParcelReport(startDate: Date, endDate: Date, format: "csv" | "pdf", res: Response) {
    const parcels = await this.parcelModel
      .find({
        createdAt: { $gte: startDate, $lte: endDate },
      })
      .populate("customerId", "name email phone")
      .populate("agentId", "userId")
      .exec()

    if (format === "csv") {
      return this.generateParcelCSV(parcels, res)
    } else {
      return this.generateParcelPDF(parcels, res)
    }
  }

  async generateRevenueReport(startDate: Date, endDate: Date, format: "csv" | "pdf", res: Response) {
    const payments = await this.paymentModel
      .find({
        createdAt: { $gte: startDate, $lte: endDate },
        status: "completed",
      })
      .populate("customerId", "name email")
      .populate("parcelId", "trackingId")
      .exec()

    if (format === "csv") {
      return this.generateRevenueCSV(payments, res)
    } else {
      return this.generateRevenuePDF(payments, res)
    }
  }

  async generateAgentReport(format: "csv" | "pdf", res: Response) {
    const agents = await this.agentModel.find().populate("userId", "name email phone").exec()

    if (format === "csv") {
      return this.generateAgentCSV(agents, res)
    } else {
      return this.generateAgentPDF(agents, res)
    }
  }

  private async generateParcelCSV(parcels: any[], res: Response) {
    const csvWriterInstance = csvWriter.createObjectCsvStringifier({
      header: [
        { id: "trackingId", title: "Tracking ID" },
        { id: "customerName", title: "Customer Name" },
        { id: "customerEmail", title: "Customer Email" },
        { id: "recipientName", title: "Recipient Name" },
        { id: "pickupAddress", title: "Pickup Address" },
        { id: "deliveryAddress", title: "Delivery Address" },
        { id: "status", title: "Status" },
        { id: "paymentType", title: "Payment Type" },
        { id: "deliveryFee", title: "Delivery Fee" },
        { id: "codAmount", title: "COD Amount" },
        { id: "createdAt", title: "Created At" },
        { id: "deliveredAt", title: "Delivered At" },
      ],
    })

    const records = parcels.map((parcel) => ({
      trackingId: parcel.trackingId,
      customerName: parcel.customerId?.name || "",
      customerEmail: parcel.customerId?.email || "",
      recipientName: parcel.recipientName,
      pickupAddress: parcel.pickupAddress,
      deliveryAddress: parcel.deliveryAddress,
      status: parcel.status,
      paymentType: parcel.paymentType,
      deliveryFee: parcel.deliveryFee,
      codAmount: parcel.codAmount,
      createdAt: parcel.createdAt.toISOString(),
      deliveredAt: parcel.deliveredAt?.toISOString() || "",
    }))

    const csvString = csvWriterInstance.getHeaderString() + csvWriterInstance.stringifyRecords(records)

    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", "attachment; filename=parcels-report.csv")
    res.send(csvString)
  }

  private async generateParcelPDF(parcels: any[], res: Response) {
    const doc = new PDFDocument()

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", "attachment; filename=parcels-report.pdf")

    doc.pipe(res)

    // Title
    doc.fontSize(20).text("Parcels Report", 50, 50)
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 80)
    doc.text(`Total Parcels: ${parcels.length}`, 50, 100)

    // Table headers
    let yPosition = 140
    doc.text("Tracking ID", 50, yPosition)
    doc.text("Customer", 150, yPosition)
    doc.text("Status", 250, yPosition)
    doc.text("Amount", 320, yPosition)
    doc.text("Date", 400, yPosition)

    yPosition += 20
    doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke()
    yPosition += 10

    // Table data
    parcels.forEach((parcel) => {
      if (yPosition > 700) {
        doc.addPage()
        yPosition = 50
      }

      doc.text(parcel.trackingId, 50, yPosition)
      doc.text(parcel.customerId?.name || "N/A", 150, yPosition)
      doc.text(parcel.status, 250, yPosition)
      doc.text(`$${parcel.deliveryFee}`, 320, yPosition)
      doc.text(parcel.createdAt.toLocaleDateString(), 400, yPosition)
      yPosition += 20
    })

    doc.end()
  }

  private async generateRevenueCSV(payments: any[], res: Response) {
    const csvWriterInstance = csvWriter.createObjectCsvStringifier({
      header: [
        { id: "transactionId", title: "Transaction ID" },
        { id: "trackingId", title: "Tracking ID" },
        { id: "customerName", title: "Customer Name" },
        { id: "amount", title: "Amount" },
        { id: "paymentType", title: "Payment Type" },
        { id: "status", title: "Status" },
        { id: "paidAt", title: "Paid At" },
      ],
    })

    const records = payments.map((payment) => ({
      transactionId: payment.transactionId,
      trackingId: payment.parcelId?.trackingId || "",
      customerName: payment.customerId?.name || "",
      amount: payment.amount,
      paymentType: payment.paymentType,
      status: payment.status,
      paidAt: payment.paidAt?.toISOString() || "",
    }))

    const csvString = csvWriterInstance.getHeaderString() + csvWriterInstance.stringifyRecords(records)

    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", "attachment; filename=revenue-report.csv")
    res.send(csvString)
  }

  private async generateRevenuePDF(payments: any[], res: Response) {
    const doc = new PDFDocument()

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", "attachment; filename=revenue-report.pdf")

    doc.pipe(res)

    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0)

    // Title
    doc.fontSize(20).text("Revenue Report", 50, 50)
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 80)
    doc.text(`Total Transactions: ${payments.length}`, 50, 100)
    doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 50, 120)

    // Table headers
    let yPosition = 160
    doc.text("Transaction ID", 50, yPosition)
    doc.text("Customer", 150, yPosition)
    doc.text("Amount", 250, yPosition)
    doc.text("Type", 320, yPosition)
    doc.text("Date", 400, yPosition)

    yPosition += 20
    doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke()
    yPosition += 10

    // Table data
    payments.forEach((payment) => {
      if (yPosition > 700) {
        doc.addPage()
        yPosition = 50
      }

      doc.text(payment.transactionId, 50, yPosition)
      doc.text(payment.customerId?.name || "N/A", 150, yPosition)
      doc.text(`$${payment.amount}`, 250, yPosition)
      doc.text(payment.paymentType, 320, yPosition)
      doc.text(payment.paidAt?.toLocaleDateString() || "N/A", 400, yPosition)
      yPosition += 20
    })

    doc.end()
  }

  private async generateAgentCSV(agents: any[], res: Response) {
    const csvWriterInstance = csvWriter.createObjectCsvStringifier({
      header: [
        { id: "name", title: "Name" },
        { id: "email", title: "Email" },
        { id: "phone", title: "Phone" },
        { id: "vehicleType", title: "Vehicle Type" },
        { id: "vehicleNumber", title: "Vehicle Number" },
        { id: "status", title: "Status" },
        { id: "totalDeliveries", title: "Total Deliveries" },
        { id: "successfulDeliveries", title: "Successful Deliveries" },
        { id: "failedDeliveries", title: "Failed Deliveries" },
        { id: "rating", title: "Rating" },
        { id: "joinedDate", title: "Joined Date" },
      ],
    })

    const records = agents.map((agent) => ({
      name: agent.userId?.name || "",
      email: agent.userId?.email || "",
      phone: agent.userId?.phone || "",
      vehicleType: agent.vehicleType,
      vehicleNumber: agent.vehicleNumber,
      status: agent.status,
      totalDeliveries: agent.totalDeliveries,
      successfulDeliveries: agent.successfulDeliveries,
      failedDeliveries: agent.failedDeliveries,
      rating: agent.rating,
      joinedDate: agent.joinedDate?.toISOString() || "",
    }))

    const csvString = csvWriterInstance.getHeaderString() + csvWriterInstance.stringifyRecords(records)

    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", "attachment; filename=agents-report.csv")
    res.send(csvString)
  }

  private async generateAgentPDF(agents: any[], res: Response) {
    const doc = new PDFDocument()

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", "attachment; filename=agents-report.pdf")

    doc.pipe(res)

    // Title
    doc.fontSize(20).text("Agents Report", 50, 50)
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 80)
    doc.text(`Total Agents: ${agents.length}`, 50, 100)

    // Table headers
    let yPosition = 140
    doc.text("Name", 50, yPosition)
    doc.text("Vehicle", 150, yPosition)
    doc.text("Status", 250, yPosition)
    doc.text("Deliveries", 320, yPosition)
    doc.text("Rating", 420, yPosition)

    yPosition += 20
    doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke()
    yPosition += 10

    // Table data
    agents.forEach((agent) => {
      if (yPosition > 700) {
        doc.addPage()
        yPosition = 50
      }

      doc.text(agent.userId?.name || "N/A", 50, yPosition)
      doc.text(`${agent.vehicleType} - ${agent.vehicleNumber}`, 150, yPosition)
      doc.text(agent.status, 250, yPosition)
      doc.text(`${agent.successfulDeliveries}/${agent.totalDeliveries}`, 320, yPosition)
      doc.text(agent.rating.toFixed(1), 420, yPosition)
      yPosition += 20
    })

    doc.end()
  }
}
