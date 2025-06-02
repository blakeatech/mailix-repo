import boto3
from botocore.exceptions import ClientError
import os
from datetime import datetime, timezone
from config.settings import settings
import ipinfo

class EmailService:
    def __init__(self):
        self.ses_client = boto3.client(
            'ses',
            region_name=settings.aws_region,
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key
        )

    def reset_password_email(self, recipient_email, reset_password_link):
        SENDER = "support@notaic.com"
        SUBJECT = "Reset Your Password"

        LINK = f"{reset_password_link}"
        
        # Get current UTC time
        current_time = datetime.now(timezone.utc).strftime("%d %B %Y, %H:%M UTC")

        BODY_HTML = f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Reset Your Password</title></head><body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f6f9fc;">
<table role="presentation" style="width:100%;border-collapse:collapse;">
<tr><td align="center" style="padding:40px 0;">
<table role="presentation" style="width:600px;border-collapse:collapse;background-color:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
<tr><td style="height:5px;background:linear-gradient(to right,#ff7f00,#ff9900);"></td></tr>
<tr><td align="center" style="padding:20px 40px;">
<h1 style="color:#333;font-size:28px;margin:0 0 20px 0;">Reset Your Password</h1>
<p style="color:#666;font-size:16px;line-height:1.6;margin:0 0 30px 0;">We received a request to reset the password for your Notaic account. Click the button below to reset your password. This link will expire in 10 minutes for your security.</p>
<a href="{LINK}" style="background-color:#ff7f00;color:#fff;text-decoration:none;padding:14px 35px;border-radius:50px;font-weight:bold;display:inline-block;font-size:16px;transition:background-color 0.3s ease;">Reset Your Password</a>
</td></tr><tr><td style="padding:30px 40px;">
<table role="presentation" style="width:100%;border-collapse:collapse;">
<tr><td style="padding:20px;background-color:#f8f9fa;border-radius:8px;">
<p style="color:#666;font-size:14px;line-height:1.5;margin:0;">Having trouble? If the button above doesn't work or you need a new link, <a href="https://www.notaic.site/resend-verification" style="color:#ff7f00;text-decoration:none;font-weight:bold;">click here to request a fresh reset password link</a>.</p>
</td></tr></table></td></tr>
<tr><td style="padding:0 40px 30px;">
<p style="color:#999;font-size:12px;line-height:1.5;margin:0;text-align:center;">
This reset password link was requested on {current_time}.<br>If you didn't make this request, please disregard this email.</p>
</td></tr><tr><td style="height:5px;background:linear-gradient(to right,#ff7f00,#ff9900);"></td></tr>
</table></td></tr></table></body></html>"""
        BODY_TEXT = f"""
        Reset Your Password

        Click the link below to reset your password. This link will expire in 10 minutes.

        {reset_password_link}
        
        If you didn't make this request, you can safely ignore this email.
        """

        email_message = {
            'Source': SENDER,
            'Destination': {
                'ToAddresses': [recipient_email],
            },
            'Message': {
                'Subject': {
                    'Data': SUBJECT,
                },
                'Body': {
                    'Text': {
                        'Data': BODY_TEXT,
                    },
                    'Html': {
                        'Data': BODY_HTML,
                    },
                },
            }
        }

        try:
            response = self.ses_client.send_email(**email_message)
            print(f"Reset password email sent to {recipient_email}! Message ID:", response['MessageId'])
            return True
        except ClientError as e:
            print(f"Error sending reset password email to {recipient_email}:", e.response['Error']['Message'])
            return False
            
    def send_verification_email(self, recipient_email, verification_link):
        SENDER = "support@notaic.com"
        SUBJECT = "Sign up to Notaic"

        LINK = f"{verification_link}"
        
        # Get current UTC time
        current_time = datetime.now(timezone.utc).strftime("%d %B %Y, %H:%M UTC")

        BODY_HTML = f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sign up to Notaic</title></head><body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f6f9fc;">
<table role="presentation" style="width:100%;border-collapse:collapse;">
<tr><td align="center" style="padding:40px 0;">
<table role="presentation" style="width:600px;border-collapse:collapse;background-color:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
<tr><td style="height:5px;background:linear-gradient(to right,#ff7f00,#ff9900);"></td></tr>
<tr><td align="center" style="padding:20px 40px;">
<h1 style="color:#333;font-size:28px;margin:0 0 20px 0;">Sign up to Notaic</h1>
<p style="color:#666;font-size:16px;line-height:1.6;margin:0 0 30px 0;">Welcome to Notaic! Click the button below to complete your sign-up process. This exclusive link will expire in 10 minutes for your security.</p>
<a href="{LINK}" style="background-color:#ff7f00;color:#fff;text-decoration:none;padding:14px 35px;border-radius:50px;font-weight:bold;display:inline-block;font-size:16px;transition:background-color 0.3s ease;">Sign up to Notaic</a>
</td></tr><tr><td style="padding:30px 40px;">
<table role="presentation" style="width:100%;border-collapse:collapse;">
<tr><td style="padding:20px;background-color:#f8f9fa;border-radius:8px;">
<p style="color:#666;font-size:14px;line-height:1.5;margin:0;">Having trouble? If the button above doesn't work or you need a new link, <a href="https://www.notaic.site/resend-verification" style="color:#ff7f00;text-decoration:none;font-weight:bold;">click here to request a fresh sign-up link</a>.</p>
</td></tr></table></td></tr>
<tr><td style="padding:0 40px 30px;">
<p style="color:#999;font-size:12px;line-height:1.5;margin:0;text-align:center;">
This sign-up link was requested on {current_time}.<br>If you didn't make this request, please disregard this email.</p>
</td></tr><tr><td style="height:5px;background:linear-gradient(to right,#ff7f00,#ff9900);"></td></tr>
</table></td></tr></table></body></html>"""
        BODY_TEXT = f"""
        Sign up to Notaic

        Click the link below to sign up to Notaic. This link will expire in 10 minutes.

        {verification_link}

        If you didn't make this request, you can safely ignore this email.
        """

        email_message = {
            'Source': SENDER,
            'Destination': {
                'ToAddresses': [recipient_email],
            },
            'Message': {
                'Subject': {
                    'Data': SUBJECT,
                },
                'Body': {
                    'Text': {
                        'Data': BODY_TEXT,
                    },
                    'Html': {
                        'Data': BODY_HTML,
                    },
                },
            }
        }

        try:
            response = self.ses_client.send_email(**email_message)
            print(f"Verification email sent to {recipient_email}! Message ID:", response['MessageId'])
            return True
        except ClientError as e:
            print(f"Error sending verification email to {recipient_email}:", e.response['Error']['Message'])
            return False

    def send_waitlist_confirmation_email(self, recipient_email, referral_code, token):
        SENDER = "support@notaic.com"
        SUBJECT = "Welcome to Notaic's Waiting List!"
        
        LINK = f"https://www.notaic.site/referral={referral_code}"

        VERIFY_LINK = f"https://www.notaic.site/verify-email?email={recipient_email}&token={token}"

        CURRENT_TIME = datetime.now(timezone.utc).strftime("%d %B %Y, %H:%M UTC")

        BODY_HTML = f"""
        <!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Welcome to Notaic's Waiting List!</title></head><body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f6f9fc"><table role="presentation" style="width:100%;border-collapse:collapse"><tr><td align="center" style="padding:40px 0"><table role="presentation" style="width:600px;border-collapse:collapse;background-color:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,.1)"><tr><td style="height:5px;background:linear-gradient(to right,#ff7f00,#f90)"></td></tr><tr><td align="center" style="padding:20px 40px"><h1 style="color:#333;font-size:28px;margin:0 0 20px 0">Welcome to Notaic's Waiting List!</h1><p style="color:#666;font-size:16px;line-height:1.6;margin:0 0 20px 0">Thank you for joining our waiting list! We're thrilled to have you on board and can't wait to revolutionize your email workflow with Notaic.</p><p style="color:#666;font-size:16px;line-height:1.6;margin:0 0 30px 0">You're now in line to be one of the first to experience our state-of-the-art email assistant. We'll keep you updated on our progress and let you know as soon as we're ready to welcome you in.</p><a href="{VERIFY_LINK}" style="background-color:#ff7f00;color:#fff;text-decoration:none;padding:14px 35px;border-radius:50px;font-weight:700;display:inline-block;font-size:16px;transition:background-color .3s ease">Verify Email</a></td></tr><tr><td style="padding:0 40px 30px"><h2 style="color:#333;font-size:22px;margin:0 0 15px 0">How Notaic Will Transform Your Email Experience</h2><ul style="color:#666;font-size:16px;line-height:1.6;margin:0 0 20px 0;padding-left:20px"><li style="margin-bottom:10px">Builds a personalized knowledge base from your sent emails</li><li style="margin-bottom:10px">Monitors incoming emails and creates drafts automatically</li><li style="margin-bottom:10px">Human-in-the-loop AI ensures you always have control</li><li style="margin-bottom:10px">Utilizes cutting-edge retrieval augmented generation</li><li>Currently available for Gmail users only</li></ul><p style="color:#666;font-size:16px;line-height:1.6;margin:0 0 30px 0">With Notaic, we're not just building another email tool. We're creating an intelligent assistant that learns from your communication style and helps you respond more efficiently and effectively. Get ready to reclaim your time and boost your productivity!</p></td></tr><tr><td style="padding:30px 40px"><table role="presentation" style="width:100%;border-collapse:collapse"><tr><td style="padding:20px;background-color:#f8f9fa;border-radius:8px"><p style="color:#666;font-size:14px;line-height:1.5;margin:0 0 10px">Excited about Notaic? Share it with your friends and earn a free month of Premium!</p><p style="color:#666;font-size:14px;line-height:1.5;margin:0">Your unique referral link:<a href="#" style="color:#ff7f00;text-decoration:none;font-weight:700"> https://www.notaic.site?referral={referral_code}</a></p></td></tr></table></td></tr><tr><td align="center" style="padding:0 40px 30px"><table role="presentation" style="border-collapse:collapse"><tr><td style="padding-right:10px"><a href="https://twitter.com/intent/tweet?text=Check%20out%20Notaic!&url=http%3A%2F%2Flocalhost%3A3000?referral={referral_code}" style="background-color:#1da1f2;color:#fff;text-decoration:none;padding:12px 25px;border-radius:50px;font-weight:700;display:inline-block;font-size:14px">Share on Twitter</a></td><td style="padding-left:10px"><a href="https://www.linkedin.com/sharing/share-offsite/?url=http%3A%2F%2Flocalhost%3A3000?referral={referral_code}" style="background-color:#0077b5;color:#fff;text-decoration:none;padding:12px 25px;border-radius:50px;font-weight:700;display:inline-block;font-size:14px">Share on LinkedIn</a></td></tr></table></td></tr><tr><td style="padding:0 40px 30px"><p style="color:#666;font-size:16px;line-height:1.6;margin:0 0 10px 0">Best,</p><p style="color:#333;font-size:18px;font-weight:700;margin:0">Blake</p><p style="color:#666;font-size:14px;margin:5px 0 0">Founder, Notaic</p></td></tr><tr><td style="padding:0 40px 30px"><p style="color:#999;font-size:12px;line-height:1.5;margin:0;text-align:center">This email was sent to confirm your addition to the Notaic waiting list.<br>If you didn't sign up for Notaic, please contact us at <a href="mailto:support@notaic.com" style="color:#ff7f00;text-decoration:none;">support@notaic.com</a>.</p></td></tr><tr><td style="height:5px;background:linear-gradient(to right,#ff7f00,#f90)"></td></tr></table></td></tr></table></body></html>
        """
        email_message = {
            'Source': SENDER,
            'Destination': {
                'ToAddresses': [recipient_email],
            },
            'Message': {
                'Subject': {
                    'Data': SUBJECT,
                },
                'Body': {
                    'Html': {
                        'Data': BODY_HTML,
                    },
                },
            }
        }

        try:
            response = self.ses_client.send_email(**email_message)
            print(f"Waitlist confirmation email sent to {recipient_email}! Message ID:", response['MessageId'])
            return True
        except ClientError as e:
            print(f"Error sending waitlist confirmation email to {recipient_email}:", e.response['Error']['Message'])
            return False

    def send_free_month_email(self, recipient_email, referral_code):
        SENDER = "support@notaic.com"
        SUBJECT = "You've Earned a Free Month!"
        
        LINK = f"https://www.notaic.site/referral={referral_code}"
        
        CURRENT_TIME = datetime.now(timezone.utc).strftime("%d %B %Y, %H:%M UTC")
        body = f"""
        <!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Your Notaic Referral Was Successful!</title></head><body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f6f9fc"><table role="presentation" style="width:100%;border-collapse:collapse"><tr><td align="center" style="padding:40px 0"><table role="presentation" style="width:600px;border-collapse:collapse;background-color:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,.1)"><tr><td style="height:5px;background:linear-gradient(to right,#ff7f00,#f90)"></td></tr><tr><td align="center" style="padding:20px 40px"><h1 style="color:#333;font-size:28px;margin:0 0 20px 0">Your Referral Was Successful!</h1><p style="color:#666;font-size:16px;line-height:1.6;margin:0 0 20px 0">Great news! Someone has signed up for a Notaic subscription using your referral code. As a thank you, you'll receive a free month of Premium when we launch!</p><p style="color:#666;font-size:16px;line-height:1.6;margin:0 0 30px 0">Want even more free Premium time? You can refer up to 3 friends to get up to 3 months of free Premium.</p></td></tr><tr><td align="center" style="padding:0 40px 30px"><table role="presentation" style="border-collapse:collapse"><tr><td style="padding-right:10px"><a href="https://twitter.com/intent/tweet?text=Check%20out%20Notaic!&url=http%3A%2F%2Flocalhost%3A3000?referral={referral_code}" style="background-color:#1da1f2;color:#fff;text-decoration:none;padding:12px 25px;border-radius:50px;font-weight:700;display:inline-block;font-size:14px">Share on Twitter</a></td><td style="padding-left:10px"><a href="https://www.linkedin.com/sharing/share-offsite/?url=http%3A%2F%2Flocalhost%3A3000?referral={referral_code}" style="background-color:#0077b5;color:#fff;text-decoration:none;padding:12px 25px;border-radius:50px;font-weight:700;display:inline-block;font-size:14px">Share on LinkedIn</a></td></tr></table></td></tr><tr><td style="padding:30px 40px"><table role="presentation" style="width:100%;border-collapse:collapse"><tr><td style="padding:20px;background-color:#f8f9fa;border-radius:8px"><p style="color:#666;font-size:14px;line-height:1.5;margin:0">Your unique referral link:<a href="#" style="color:#ff7f00;text-decoration:none;font-weight:700"> https://www.notaic.site?referral={referral_code}</a></p><p style="color:#666;font-size:14px;line-height:1.5;margin:10px 0 0">Share this link with your friends to give them a special offer and earn more free Premium time for yourself!</p></td></tr></table></td></tr><tr><td style="padding:0 40px 30px"><p style="color:#999;font-size:12px;line-height:1.5;margin:0;text-align:center">This email was sent to confirm your addition to the Notaic waiting list.<br>If you didn't sign up for Notaic, please contact us at <a href="mailto:support@notaic.com" style="color:#ff7f00;text-decoration:none;">support@notaic.com</a>.</p></td></tr><tr><td style="height:5px;background:linear-gradient(to right,#ff7f00,#f90)"></td></tr></table></td></tr></table></body></html>
        """

        email_message = {
            'Source': SENDER,
            'Destination': {
                'ToAddresses': [recipient_email],
            },
            'Message': {
                'Subject': {
                    'Data': SUBJECT,
                },
                'Body': {
                    'Html': {
                        'Data': body,
                    },
                },
            }
        }

        try:
            response = self.ses_client.send_email(**email_message)
            print(f"Free month email sent to {recipient_email}! Message ID:", response['MessageId'])
            return True
        except ClientError as e:
            print(f"Error sending free month email to {recipient_email}:", e.response['Error']['Message'])
            return False
