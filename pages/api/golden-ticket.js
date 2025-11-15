export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const {
      ticketCode,
      firstName,
      lastName,
      email,
      phone,
      street,
      city,
      postalCode,
      country,
      source,
      offer,
      utm_source,
      utm_medium,
      utm_campaign,
      consent,
      consentTs,
      newsletterOptIn
    } = req.body;

    // Validierung
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "Gültige E-Mail erforderlich" });
    }

    if (!ticketCode || !/^[A-Z0-9]{8}$/.test(ticketCode)) {
      return res.status(400).json({ message: "Gültiger 8-stelliger Code erforderlich" });
    }

    // Mailchimp API Setup
    const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
    const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;

    if (!MAILCHIMP_API_KEY || !MAILCHIMP_AUDIENCE_ID) {
      console.error("❌ Mailchimp credentials missing");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const datacenter = MAILCHIMP_API_KEY.split("-")[1];
    const mailchimpUrl = `https://${datacenter}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`;

    // Erstelle Mailchimp Member Objekt
    const memberData = {
      email_address: email,
      status: newsletterOptIn ? "pending" : "transactional", // "transactional" = nur Datenspeicherung, kein Marketing
      merge_fields: {
        FNAME: firstName || "",
        LNAME: lastName || "",
        PHONE: phone || "",
        TICKET: ticketCode || "",
        OFFER: offer || "Adventskalender 2025",
        SOURCE: source || "golden_ticket",
      },
      tags: [
        "gewinnspiel-teilnehmer",
        "golden-ticket-2024",
        source || "golden_ticket",
        `ticket-${ticketCode.substring(0, 3)}`, // Erste 3 Zeichen des Codes
      ],
    };

    // Füge Adresse hinzu wenn vorhanden
    if (street && city && postalCode && country) {
      memberData.merge_fields.ADDRESS = {
        addr1: street,
        city: city,
        zip: postalCode,
        country: country,
      };
      memberData.tags.push("address-provided");
    }

    // UTM Tags hinzufügen
    if (utm_source) {
      memberData.merge_fields.UTM_SOURCE = utm_source;
      memberData.tags.push(`utm_source_${utm_source}`);
    }
    if (utm_medium) {
      memberData.merge_fields.UTM_MEDIUM = utm_medium;
    }
    if (utm_campaign) {
      memberData.merge_fields.UTM_CAMPAIGN = utm_campaign;
      memberData.tags.push(`utm_campaign_${utm_campaign}`);
    }

    // Newsletter-Tags hinzufügen wenn Opt-In
    if (newsletterOptIn) {
      memberData.tags.push("newsletter-opt-in");
      memberData.tags.push("golden-ticket-gewinnspiel");
    }

    console.log("📤 Sende an Mailchimp:", {
      email,
      status: memberData.status,
      tags: memberData.tags,
    });

    // Mailchimp API Call mit PUT (upsert)
    const emailHash = require("crypto")
      .createHash("md5")
      .update(email.toLowerCase())
      .digest("hex");

    const response = await fetch(`${mailchimpUrl}/${emailHash}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${MAILCHIMP_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(memberData),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("❌ Mailchimp API Error:", responseData);

      // Auch bei Fehler weiterhin erfolgreich antworten (Gewinnspiel-Teilnahme ist gespeichert)
      console.log("⚠️  Gewinnspiel-Teilnahme registriert, aber Mailchimp-Sync fehlgeschlagen");
    } else {
      console.log("✅ Golden Ticket Teilnahme in Mailchimp gespeichert:", {
        email: responseData.email_address,
        ticketCode,
        status: responseData.status,
        tags: responseData.tags?.map(t => t.name) || [],
      });
    }

    // Erfolgsantwort an Client
    return res.status(200).json({
      success: true,
      message: "Teilnahme erfolgreich registriert",
      ticketCode,
      email,
      mailchimpSynced: response.ok,
    });

  } catch (error) {
    console.error("❌ Golden Ticket API Error:", error);
    return res.status(500).json({
      message: "Interner Server-Fehler",
      error: error.message,
    });
  }
}
