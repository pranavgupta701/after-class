// Table layout and inline styles keep the email readable in Outlook and mobile clients.
function verificationEmail(code) {
  if (!/^\d{6}$/.test(String(code))) throw new Error('Verification code must contain six digits.');
  const origin = 'https://afterclass.neuralagent.dev';
  return {
    subject: 'Your Afterclass verification code',
    text: `afterclass\nFor the life between lectures.\n\nYour verification code is ${code}.\n\nEnter this code in Afterclass to continue. It expires in 10 minutes.\nNever share this code with anyone.\n\nIf you did not request this email, you can safely ignore it.\n\n${origin}`,
    html: `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Your Afterclass verification code</title></head>
<body style="margin:0;padding:0;background-color:#f3f5ef;color:#244d42;font-family:Arial,Helvetica,sans-serif;">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">Your sign-in code is ready. Enter it in Afterclass within 10 minutes.</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f3f5ef"><tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;">
<tr><td style="padding:0 8px 24px;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>
<td width="48"><a href="${origin}" style="text-decoration:none;"><img src="${origin}/icon-192.png" width="44" height="44" alt="Afterclass logo" style="display:block;border:0;border-radius:12px;"></a></td>
<td style="padding-left:12px;color:#244d42;font-size:27px;font-weight:bold;letter-spacing:-1px;">afterclass<span style="color:#de8e71;">.</span></td>
</tr></table></td></tr>
<tr><td bgcolor="#ffffff" style="padding:36px 28px;border:1px solid #dfe5da;border-radius:20px;">
<p style="margin:0 0 16px;color:#65775f;font-size:11px;font-weight:bold;letter-spacing:2px;">YOUR CAMPUS. YOUR PEOPLE.</p>
<h1 style="margin:0 0 16px;color:#244d42;font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:1.2;font-weight:normal;">You're almost in.</h1>
<p style="margin:0 0 26px;color:#5d6b61;font-size:16px;line-height:1.7;">A conversation, a shared interest, a new connection.<br>Enter this code in Afterclass to continue.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td align="center" bgcolor="#edf2df" style="padding:22px 12px;border:1px solid #dde5cc;border-radius:12px;">
<p style="margin:0 0 12px;color:#526747;font-size:11px;font-weight:bold;letter-spacing:2px;">YOUR VERIFICATION CODE</p>
<p style="margin:0;color:#244d42;font-family:'Courier New',Courier,monospace;font-size:36px;font-weight:bold;line-height:1.3;letter-spacing:5px;">${code}</p>
<p style="margin:12px 0 0;color:#526747;font-size:13px;line-height:1.5;">Valid for <strong>10 minutes</strong></p>
</td></tr></table>
<p style="margin:24px 0 0;color:#5d6b61;font-size:14px;line-height:1.7;">Keep this code private. Never share it with anyone.</p>
<p style="margin:16px 0 0;padding-top:20px;border-top:1px solid #e8ece3;color:#788175;font-size:13px;line-height:1.7;">Didn't request a code? You can safely ignore this email.</p>
</td></tr>
<tr><td align="center" style="padding:24px 16px;color:#788175;font-size:12px;line-height:1.8;">
<p style="margin:0 0 6px;color:#526747;font-family:Georgia,'Times New Roman',serif;font-size:16px;">For the life between lectures.</p>
<a href="${origin}" style="color:#526747;text-decoration:underline;">afterclass.neuralagent.dev</a>
</td></tr></table></td></tr></table></body></html>`
  };
}
module.exports = { verificationEmail };
