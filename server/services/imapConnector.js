import tls from 'tls';
import net from 'net';

/**
 * Clean helper to decode MIME encoded-words (=?UTF-8?B?...?= or =?UTF-8?Q?...?=)
 */
export function decodeMimeHeader(headerStr = '') {
  if (!headerStr) return '';
  return headerStr.replace(/=\?([^?]+)\?([BQbq])\?([^?]+)\?=/g, (match, charset, encoding, text) => {
    try {
      if (encoding.toUpperCase() === 'B') {
        return Buffer.from(text, 'base64').toString(charset.toLowerCase() === 'utf-8' ? 'utf8' : 'latin1');
      } else if (encoding.toUpperCase() === 'Q') {
        const decoded = text.replace(/_/g, ' ').replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => {
          return String.fromCharCode(parseInt(hex, 16));
        });
        return decoded;
      }
    } catch (e) {
      return text;
    }
    return match;
  });
}

/**
 * Extracts display name and email address from header like 'John Doe <john@company.com>'
 */
export function parseAddress(addressStr = '') {
  const match = addressStr.match(/^(?:["']?([^"']*)["']?\s*)?<?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>?$/);
  if (match) {
    const name = (match[1] || '').trim();
    const email = match[2].trim().toLowerCase();
    return { name: decodeMimeHeader(name) || email.split('@')[0], email };
  }
  return { name: addressStr.split('@')[0] || 'Sender', email: addressStr.trim().toLowerCase() };
}

/**
 * Lightweight Zero-Dependency IMAP Client over TLS
 */
export class ImapService {
  constructor(options) {
    this.host = options.host;
    this.port = parseInt(options.port || 993, 10);
    this.user = options.user;
    this.password = options.password;
    this.timeout = options.timeout || 15000;
  }

  /**
   * Tests connection and credentials
   */
  async testConnection() {
    return new Promise((resolve, reject) => {
      let isResolved = false;
      const socket = tls.connect(
        {
          host: this.host,
          port: this.port,
          rejectUnauthorized: false
        },
        () => {
          // Connected
        }
      );

      socket.setTimeout(this.timeout);

      let buffer = '';
      let tagCount = 1;

      const finish = (err, result) => {
        if (isResolved) return;
        isResolved = true;
        try {
          socket.write(`TAG${tagCount++} LOGOUT\r\n`);
          socket.end();
        } catch (e) {}
        if (err) reject(err);
        else resolve(result);
      };

      socket.on('timeout', () => finish(new Error('Connection timed out to ' + this.host)));
      socket.on('error', (err) => finish(err));

      socket.on('data', (data) => {
        buffer += data.toString();
        const lines = buffer.split('\r\n');

        for (const line of lines) {
          if (line.includes('* OK')) {
            // Server ready -> send LOGIN
            socket.write(`TAG${tagCount} LOGIN "${this.user}" "${this.password}"\r\n`);
          } else if (line.startsWith(`TAG${tagCount} OK`)) {
            finish(null, { success: true, message: 'Authentication successful.' });
            break;
          } else if (line.startsWith(`TAG${tagCount} NO`) || line.startsWith(`TAG${tagCount} BAD`)) {
            finish(new Error(`IMAP Authentication failed: ${line}`));
            break;
          }
        }
      });
    });
  }

  /**
   * Fetches the latest N emails from INBOX
   */
  async fetchRecentEmails(maxCount = 10) {
    return new Promise((resolve, reject) => {
      let isResolved = false;
      const socket = tls.connect(
        {
          host: this.host,
          port: this.port,
          rejectUnauthorized: false
        },
        () => {}
      );

      socket.setTimeout(this.timeout);

      let state = 'CONNECTING'; // CONNECTING -> LOGIN_SENT -> SELECT_SENT -> FETCH_SENT -> DONE
      let buffer = '';
      let tagCount = 1;
      let totalMessages = 0;
      let rawFetchBuffer = '';

      const finish = (err, result) => {
        if (isResolved) return;
        isResolved = true;
        try {
          socket.write(`TAG${tagCount++} LOGOUT\r\n`);
          socket.end();
        } catch (e) {}
        if (err) reject(err);
        else resolve(result);
      };

      socket.on('timeout', () => finish(new Error('IMAP fetch timed out')));
      socket.on('error', (err) => finish(err));

      socket.on('data', (data) => {
        buffer += data.toString();

        if (state === 'CONNECTING' && buffer.includes('* OK')) {
          state = 'LOGIN_SENT';
          tagCount++;
          socket.write(`TAG${tagCount} LOGIN "${this.user}" "${this.password}"\r\n`);
          buffer = '';
        } else if (state === 'LOGIN_SENT' && buffer.includes(`TAG${tagCount} OK`)) {
          state = 'SELECT_SENT';
          tagCount++;
          socket.write(`TAG${tagCount} SELECT INBOX\r\n`);
          buffer = '';
        } else if (state === 'LOGIN_SENT' && (buffer.includes(`TAG${tagCount} NO`) || buffer.includes(`TAG${tagCount} BAD`))) {
          finish(new Error('IMAP Login failed. Check your email & password.'));
        } else if (state === 'SELECT_SENT' && buffer.includes(`TAG${tagCount} OK`)) {
          // Extract message count: '* 42 EXISTS'
          const match = buffer.match(/\*\s+(\d+)\s+EXISTS/i);
          totalMessages = match ? parseInt(match[1], 10) : 0;

          if (totalMessages === 0) {
            finish(null, []);
            return;
          }

          const start = Math.max(1, totalMessages - (maxCount - 1));
          state = 'FETCH_SENT';
          tagCount++;
          // Fetch headers and body text
          socket.write(`TAG${tagCount} FETCH ${start}:${totalMessages} (RFC822.HEADER BODY.PEEK[TEXT])\r\n`);
          buffer = '';
          rawFetchBuffer = '';
        } else if (state === 'FETCH_SENT') {
          rawFetchBuffer += buffer;
          buffer = '';

          if (rawFetchBuffer.includes(`TAG${tagCount} OK`)) {
            state = 'DONE';
            const parsed = this._parseFetchResponses(rawFetchBuffer);
            finish(null, parsed);
          }
        }
      });
    });
  }

  _parseFetchResponses(rawText) {
    const emails = [];
    // Split by '* <seq> FETCH'
    const parts = rawText.split(/\*\s+\d+\s+FETCH\s+\(/i).slice(1);

    for (let i = parts.length - 1; i >= 0; i--) {
      const part = parts[i];
      try {
        const email = this._parseSingleFetch(part, i);
        if (email && email.subject) {
          emails.push(email);
        }
      } catch (e) {
        console.warn('Error parsing email part:', e);
      }
    }

    return emails;
  }

  _parseSingleFetch(partText, index) {
    // Extract headers: Subject, From, To, Date, Message-ID
    const subjectMatch = partText.match(/^Subject:\s*(.*)$/im);
    const fromMatch = partText.match(/^From:\s*(.*)$/im);
    const toMatch = partText.match(/^To:\s*(.*)$/im);
    const dateMatch = partText.match(/^Date:\s*(.*)$/im);
    const msgIdMatch = partText.match(/^Message-ID:\s*(.*)$/im);

    const rawSubject = subjectMatch ? subjectMatch[1].trim() : 'No Subject';
    const rawFrom = fromMatch ? fromMatch[1].trim() : 'Unknown Sender';
    const rawTo = toMatch ? toMatch[1].trim() : '';
    const rawDate = dateMatch ? dateMatch[1].trim() : new Date().toISOString();
    const msgId = msgIdMatch ? msgIdMatch[1].replace(/[<>]/g, '').trim() : `msg-${Date.now()}-${index}`;

    const parsedSender = parseAddress(rawFrom);
    const subject = decodeMimeHeader(rawSubject);

    // Extract body snippet: look for BODY[TEXT] content
    let body = '';
    const bodyMatch = partText.match(/BODY\[TEXT\]\s*\{(\d+)\}\r\n([\s\S]*)/i);
    if (bodyMatch) {
      body = bodyMatch[2];
      // Strip trailing fetch parenthesis and server tag if present
      body = body.split(/\r\n\)\r\n/)[0];
    } else {
      // Fallback: take text after blank line
      const lines = partText.split('\r\n');
      const emptyIdx = lines.findIndex(l => l.trim() === '');
      if (emptyIdx !== -1) {
        body = lines.slice(emptyIdx + 1, emptyIdx + 25).join('\n');
      }
    }

    // Clean HTML tags and decode basic entities if present
    const cleanBody = body
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 1500);

    let parsedDate = new Date();
    try {
      parsedDate = new Date(rawDate);
      if (isNaN(parsedDate.getTime())) parsedDate = new Date();
    } catch (e) {
      parsedDate = new Date();
    }

    return {
      id: msgId,
      threadId: `th-imap-${msgId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32) || Date.now() + '-' + index}`,
      subject: subject || 'No Subject',
      sender: {
        name: parsedSender.name || parsedSender.email,
        email: parsedSender.email,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(parsedSender.name || parsedSender.email)}`
      },
      recipients: [rawTo || this.user],
      date: parsedDate.toISOString(),
      body: cleanBody || '(No message content)'
    };
  }
}

/**
 * Lightweight Zero-Dependency SMTP Client over TLS (Port 465)
 */
export class SmtpService {
  constructor(options) {
    this.host = options.host;
    this.port = parseInt(options.port || 465, 10);
    this.user = options.user;
    this.password = options.password;
    this.timeout = options.timeout || 15000;
  }

  async sendMail({ from, to, subject, text }) {
    return new Promise((resolve, reject) => {
      let isResolved = false;
      const socket = tls.connect(
        {
          host: this.host,
          port: this.port,
          rejectUnauthorized: false
        },
        () => {}
      );

      socket.setTimeout(this.timeout);

      let step = 0;
      let buffer = '';

      const finish = (err, result) => {
        if (isResolved) return;
        isResolved = true;
        try {
          socket.write('QUIT\r\n');
          socket.end();
        } catch (e) {}
        if (err) reject(err);
        else resolve(result);
      };

      socket.on('timeout', () => finish(new Error('SMTP sending timed out')));
      socket.on('error', (err) => finish(err));

      socket.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.trim().split('\r\n');
        const lastLine = lines[lines.length - 1];
        const code = parseInt(lastLine.slice(0, 3), 10);

        if (isNaN(code)) return;

        // Sequence of SMTP steps
        if (step === 0 && code === 220) {
          // Connected -> Send EHLO
          step = 1;
          socket.write('EHLO localhost\r\n');
        } else if (step === 1 && code === 250) {
          // Send AUTH LOGIN
          step = 2;
          socket.write('AUTH LOGIN\r\n');
        } else if (step === 2 && code === 334) {
          // Send Base64 Username
          step = 3;
          socket.write(Buffer.from(this.user).toString('base64') + '\r\n');
        } else if (step === 3 && code === 334) {
          // Send Base64 Password
          step = 4;
          socket.write(Buffer.from(this.password).toString('base64') + '\r\n');
        } else if (step === 4 && code === 235) {
          // Authenticated -> Send MAIL FROM
          step = 5;
          socket.write(`MAIL FROM:<${from || this.user}>\r\n`);
        } else if (step === 5 && code === 250) {
          // Send RCPT TO
          step = 6;
          socket.write(`RCPT TO:<${to}>\r\n`);
        } else if (step === 6 && code === 250) {
          // Send DATA
          step = 7;
          socket.write('DATA\r\n');
        } else if (step === 7 && code === 354) {
          // Send Raw Email Content
          step = 8;
          const rawMessage = [
            `From: ${from || this.user}`,
            `To: ${to}`,
            `Subject: ${subject}`,
            `Date: ${new Date().toUTCString()}`,
            `MIME-Version: 1.0`,
            `Content-Type: text/plain; charset=UTF-8`,
            ``,
            text,
            `.`
          ].join('\r\n') + '\r\n';

          socket.write(rawMessage);
        } else if (step === 8 && code === 250) {
          finish(null, { success: true, message: 'Email sent successfully via SMTP.' });
        } else if (code >= 400) {
          finish(new Error(`SMTP Error [${code}]: ${lastLine}`));
        }

        buffer = '';
      });
    });
  }
}
