import asyncio
import sys
from openai import AsyncOpenAI
from app.config.settings import settings
import pandas as pd
import json
import aiohttp

# Add these imports
if sys.platform.startswith('win'):
    from asyncio import WindowsSelectorEventLoopPolicy
    asyncio.set_event_loop_policy(WindowsSelectorEventLoopPolicy())

promotional_prompt = """
You are a professional copywriter for a marketing agency. Generate a promotional email for any product or service.

First, come up with the service or product that the email is promoting. It can either be a physical product or a digital product or for an announcement from a business.

Then, write the email.

In addition, you must address the email to a random first name.

Don't placeholder tags such as Hi [First Name]. Use a real name please.

Note that emails that look non-promotional can be promotional if they are promoting a product or service, or someone's business or community.

Please choose from a variety of subjects, lengths, and body text to create a unique email each time.

Output the email in JSON format.

Here are some examples of promotional emails:

<<EXAMPLE>>
Blake, You have a new job: Customer Service Representative.

<<EXAMPLE>>
Hey Blake,

Raising money is usually really, really hard. However, there is a way you can have investors actually fighting to give you money.

I'll explain how you can capture this magic in today's post. The post is titled, How Do You Gain Leverage When You're Raising Money? I hope you like it.

Thanks,

Brett

PS: Do You Want To Grow Your Business? Maybe I Can Help. Click Here.

PPS: I Just started a new community for startup CEOs that are growing their business or raising funding. Get lifetime free membership by clicking this link.
<<EXAMPLE>>
Hi Bob,

This month, we celebrated World Mental Health Day, and we’re so happy that there’s a day of the year devoted entirely to mental health. But here’s the thing…one day isn’t enough. Mental health is important every day of the year.

In honor of the holiday, we’re making it easier to get started with mental health support that you can rely on year-round. Get 30% off your first month of therapy when you sign up in October – and make talking and messaging with your therapist a part of your fall routine.

Find a therapist→

As always, reach out anytime if you have questions or need assistance getting matched with a different therapist – we’re here to help.

With love and therapy,
Maria and the BetterHelp Team

P.S. We accept HSA/FSA cards and are recognized as an eligible expense by most providers. Check it out.

<<EXAMPLE>>
Google Workspace
Mark Cuban chooses Gemini for Google Workspace to give his companies an edge

Learn how Gemini for Workspace unlocks a whole new level of productivity for Mark Cuban’s company Cost Plus Drugs.

Activate your Gemini trial
Mark Cuban and Cost Plus Drugs are achieving their mission to provide low-cost, high-quality pharmaceuticals to everyone thanks to a stellar team and best-in-class collaboration tools. That’s why they’re using Gemini for Google Workspace.

<<EXAMPLE>>
	
Forwarded this email? Subscribe here for more
The Weekender: Synesthesia, the art of breakfast, and Megalopolis
What we’re reading, watching, and listening to this week
Substack
Oct 19

 




READ IN APP
 

A painting by Felicity Keefe
Happy Saturday. This week, we’re reading about high-brow listicles, remembering an iconic radio host, and fondly contemplating the horror of turning into our parents. Enjoy.


SENSATION
Seeing scents
Synesthesia, the experience of sensory information through multiple unrelated senses, has a few (relatively) common guises: associating numbers with colors or letters, or being able to “see” music. In Gonzo Fumes, David Seth Moltz explains how his synesthesia—he experiences scents as colors—informs his work as a perfumer. 

<<EXAMPLE>>


LinkedIn	
Blake Martin
Your job alert for software engineer
30+ new jobs in New York match your preferences.
Quest Partners LLC	
Research Data Engineer
Quest Partners LLC · New York, United States

National Hockey League (NHL)	
ETL Developer
National Hockey League (NHL) · New York, NY (On-site)

Paul Hastings	
Data Engineer
Paul Hastings · New York, United States (On-site)

$112K-$163K / year

JPMorganChase	
Machine Learning Engineer
JPMorganChase · New York, NY

Duo Xu	
24 connections

Jobs via Dice	
Tableau Developer
Jobs via Dice · Albany, NY (Hybrid)

Notion	
Software Engineer, Search
Notion · New York, NY (On-site)

Nancy Liu	
1 connection

See all jobs
Premium icon
Blake Martin
Job search smarter with Premium
Try 1 month for $0
Get the new LinkedIn desktop app
"""

non_promotional_prompt = """
You are either a friend or colleague of someone with whom you share a personal relationship with.

Generate either a personal or professional email to a random first name please.

First, come up with a reason that the person would be writing the email either for a personal or professional reason.

Then, write the email.

Please choose from a variety of subjects, lengths, and body text to create a unique email each time.

Don't placeholder tags such as Hi [First Name]. Make it sound like you hand-wrote it. Use a real name please.

Please make sure the email sounds human-like.

Output the email in JSON format.

Here are some examples of non-promotional emails:

<<EXAMPLE>>
Hey bro,

Can we do a get together next Friday at 10 PM? I missed seeing you.

Please bring Coca Cola.

Best,
Bob

<<EXAMPLE>>
Hi Lindsey,

That's great to hear!
Thanks for pointing that out. I'll update the code to factor in the older course numbers going forward.
Regarding online students, that functionality isn't available yet, but I can add it. The best solution might be to ask students upfront if they're fully online and then use the appropriate degree requirements.
I'll work on these improvements next week. Let me know if anything else comes up.
Thanks, and have a great weekend!

<<EXAMPLE>>
Hello all,

 

I met with IT and registrar today. They said our system is not able to pull the data requested (degree requirements). Basically a system limitation. Information is linked to each student. We are not the host of Blackbaud and therefore don’t have access to the raw data nor do we have programmers to maintain (which might be your intent to do…)

 

They did see the value in providing course schedules in the app for advisors/students to put in the classes they need to have a schedule built.

 

I know this is disappointing but I can keep looking into ideas and avenues to explore down the road. It would essentially be the man power to type up the degrees because the computation takes place within the Blackbaud system and there aren’t data points to pull from this (I’m not sure I said that right).

 

Also, there is the security concern as well with sharing student information.

We thought about potentially paying an intern to set up this information but Registrar doesn’t even use student workers to protect confidentiality so a student intern would not work wither.  

 

Let me know your thoughts or if there are other suggestions.

<<EXAMPLE>>
Hey Zach,

We’re looking to incorporate functionality for transfer students in our app.

At present, when a student is a transfer, we redirect them to a page that informs them we’re unable to perform audits for transfer students at this time. This is because their StudentCourseAudit transcript doesn’t include courses they completed at their previous institution and doesn't show which KWC courses those credits apply to.
Do you know if there is a table that contains the courses they've previously taken or received credit for? It would be a great help as we work to add this feature.

Best regards,
Blake

<<EXAMPLE>>
Hi Adam,

Thank you for sending the offer over. It was a pleasure speaking with everyone today. I'm happy to share that I will be accepting the offer! Tuesday sounds good.

I'm excited about the potential of the revenue sharing we briefly discussed for software projects. Happy to explore this further when the time is right for you and the team.

Best regards,
Blake

<<EXAMPLE>>
Thanks Blake! I agree that just asking students if they are a campus student or fully online student is probably best. Thank you again for all your hard work on this project.
"""

class SyntheticEmails:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.emails = []

    async def generate_email(self, prompt):
        response = await self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that generates emails."},
                {"role": "user", "content": prompt}
            ],
            functions=[
                {
                    "name": "generate_email",
                    "description": "Generate an email.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "subject": {
                                "type": "string",
                                "description": "The subject of the email."
                            },
                            "body": {
                                "type": "string",
                                "description": "The body of the email."
                            }
                        },
                        "required": ["subject", "body"]
                    }
                }
            ],
            function_call={"name": "generate_email"}
        )
        return response.choices[0].message.function_call.arguments

    async def generate_batch_emails(self, num_emails):
        promotional_tasks = [self.generate_email(promotional_prompt) for _ in range(num_emails)]
        non_promotional_tasks = [self.generate_email(non_promotional_prompt) for _ in range(num_emails)]

        promotional_results = await asyncio.gather(*promotional_tasks)
        non_promotional_results = await asyncio.gather(*non_promotional_tasks)

        promotional_emails = []
        non_promotional_emails = []

        for email in promotional_results:
            try:
                email_json = json.loads(email)
                promotional_emails.append({'body': email_json['body'], 'promotional': True})
            except Exception as e:
                print(f"Error processing promotional email: {e}")

        for email in non_promotional_results:
            try:
                email_json = json.loads(email)
                non_promotional_emails.append({'body': email_json['body'], 'promotional': False})
            except Exception as e:
                print(f"Error processing non-promotional email: {e}")

        all_emails = promotional_emails + non_promotional_emails
        return pd.DataFrame(all_emails)

    def save_emails(self, emails):
        local_path = r'C:/Users/HP/emailai-backend/app/data/synthetic_emails.csv'
        emails.to_csv(local_path, index=False)

async def main():
    client = SyntheticEmails()
    emails = await client.generate_batch_emails(500)
    client.save_emails(emails)
    print(emails)

if __name__ == "__main__":
    asyncio.run(main())
