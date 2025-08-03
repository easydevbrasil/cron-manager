import nodemailer from "nodemailer";
import { CronTask } from "@shared/schema";

interface EmailConfig {
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  fromEmail?: string;
  toEmails?: string[];
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private config: EmailConfig;

  constructor() {
    this.config = {
      smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
      smtpPort: parseInt(process.env.SMTP_PORT || "587"),
      smtpUser: process.env.SMTP_USER,
      smtpPassword: process.env.SMTP_PASSWORD,
      fromEmail: process.env.FROM_EMAIL,
      toEmails: process.env.TO_EMAILS?.split(",") || [],
    };

    this.initializeTransporter();
  }

  private initializeTransporter() {
    if (!this.config.smtpUser || !this.config.smtpPassword) {
      console.log("Email service not configured - SMTP credentials missing");
      return;
    }

    this.transporter = nodemailer.createTransporter({
      host: this.config.smtpHost,
      port: this.config.smtpPort,
      secure: this.config.smtpPort === 465,
      auth: {
        user: this.config.smtpUser,
        pass: this.config.smtpPassword,
      },
    });

    console.log("Email service initialized");
  }

  async sendTaskNotification(
    task: CronTask,
    status: "success" | "error",
    details: any
  ): Promise<boolean> {
    if (!this.transporter || !this.config.fromEmail || this.config.toEmails.length === 0) {
      console.log("Email service not properly configured - skipping notification");
      return false;
    }

    try {
      const subject = `[Cron Manager] ${status === "success" ? "✅" : "❌"} ${task.name}`;
      const statusText = status === "success" ? "executada com sucesso" : "falhou na execução";
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${status === "success" ? "#22c55e" : "#ef4444"}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">
              ${status === "success" ? "🟢" : "🔴"} Tarefa ${statusText}
            </h1>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb;">
            <h2 style="margin-top: 0; color: #374151;">Detalhes da Tarefa</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Nome:</td>
                <td style="padding: 8px 0; color: #374151;">${task.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Descrição:</td>
                <td style="padding: 8px 0; color: #374151;">${task.description || "Não informado"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Comando:</td>
                <td style="padding: 8px 0; color: #374151; font-family: monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${task.command}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Expressão Cron:</td>
                <td style="padding: 8px 0; color: #374151; font-family: monospace;">${task.cronExpression}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Data/Hora:</td>
                <td style="padding: 8px 0; color: #374151;">${new Date().toLocaleString("pt-BR")}</td>
              </tr>
            </table>
          </div>
          
          ${details && Object.keys(details).length > 0 ? `
          <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
            <h3 style="margin-top: 0; color: #374151;">Informações Adicionais</h3>
            <pre style="background: #f3f4f6; padding: 12px; border-radius: 4px; overflow-x: auto; font-size: 12px; color: #374151;">${JSON.stringify(details, null, 2)}</pre>
          </div>
          ` : ""}
          
          <div style="background: #f9fafb; padding: 15px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #6b7280;">
              Esta notificação foi enviada automaticamente pelo Sistema de Gerenciamento de Tarefas Cron
            </p>
          </div>
        </div>
      `;

      const info = await this.transporter.sendMail({
        from: `"Cron Manager" <${this.config.fromEmail}>`,
        to: this.config.toEmails.join(", "),
        subject: subject,
        html: html,
      });

      console.log(`Email sent successfully: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error("Failed to send email notification:", error);
      return false;
    }
  }

  async sendSystemNotification(
    title: string,
    message: string,
    type: "info" | "warning" | "error" = "info"
  ): Promise<boolean> {
    if (!this.transporter || !this.config.fromEmail || this.config.toEmails.length === 0) {
      return false;
    }

    try {
      const colors = {
        info: "#3b82f6",
        warning: "#f59e0b",
        error: "#ef4444"
      };

      const icons = {
        info: "ℹ️",
        warning: "⚠️",
        error: "🚨"
      };

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${colors[type]}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">
              ${icons[type]} ${title}
            </h1>
          </div>
          
          <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
            <p style="margin: 0; color: #374151; line-height: 1.5;">${message}</p>
            <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">
              Enviado em: ${new Date().toLocaleString("pt-BR")}
            </p>
          </div>
        </div>
      `;

      await this.transporter.sendMail({
        from: `"Cron Manager System" <${this.config.fromEmail}>`,
        to: this.config.toEmails.join(", "),
        subject: `[Cron Manager] ${title}`,
        html: html,
      });

      return true;
    } catch (error) {
      console.error("Failed to send system notification:", error);
      return false;
    }
  }

  updateConfig(newConfig: Partial<EmailConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.initializeTransporter();
  }

  isConfigured(): boolean {
    return !!(
      this.transporter && 
      this.config.fromEmail && 
      this.config.toEmails.length > 0
    );
  }
}

export const emailService = new EmailService();