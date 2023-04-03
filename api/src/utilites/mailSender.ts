import * as nodemailer from "nodemailer";

export class MailSender {
    private transporter
    private static mailSender: MailSender

    private constructor() {
        this.transporter = nodemailer.createTransport({
            port: 465,               // true for 465, false for other ports
            host: "smtp.gmail.com",
            auth: {
                user: 'agilismilliomos@gmail.com',
                pass: 'kjqtlxucotnnmdgr',
            },
            secure: true,
        })
    }

    public static instance() {
        if (!this.mailSender) {
            this.mailSender = new MailSender()
        }

        return this.mailSender
    }

    public sendEmail(to = "", subject = "", content = "") {
        this.transporter.sendMail({
            from: 'agilismilliomos@gmail.com',
            to: to,
            subject: subject,
            text: content
        })
    }
}
