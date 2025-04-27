module.exports = {
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    from: process.env.EMAIL_FROM || 'ApexTrades <no-reply@apextrades.com>'
  };