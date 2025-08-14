// pages/api/newsletter.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, firstName } = req.body;

  try {
    // Hier würdest du deine Newsletter-API integrieren (z.B. Mailchimp, ConvertKit, etc.)
    // Beispiel für Mailchimp:
    /*
    const mailchimp = require('@mailchimp/mailchimp_marketing');
    
    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_API_KEY,
      server: 'us1', // Dein Mailchimp Server
    });

    const response = await mailchimp.lists.addListMember(process.env.MAILCHIMP_LIST_ID, {
      email_address: email,
      status: 'subscribed',
      merge_fields: {
        FNAME: firstName || '',
      },
    });
    */

    // Für Demo-Zwecke simulieren wir eine erfolgreiche Anmeldung
    console.log('Newsletter signup:', { email, firstName });
    
    // Hier könntest du auch eine Willkommens-E-Mail senden
    
    res.status(200).json({ 
      message: 'Successfully subscribed!',
      email: email 
    });
  } catch (error) {
    console.error('Newsletter signup error:', error);
    res.status(500).json({ 
      message: 'Subscription failed',
      error: error.message 
    });
  }
}
