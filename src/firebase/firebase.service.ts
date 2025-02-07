import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';
import { join } from 'path';

@Injectable()
export class FirebaseService {
  private messaging: admin.messaging.Messaging;

  constructor() {
    const serviceAccount = require(join(__dirname, '../../firebase-admin.json'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    this.messaging = admin.messaging();
  }

  async sendNotification(token: string, title: string, body: string) {
    const message = {
      notification: { title, body },
      token,
    };

    try {
      const response = await this.messaging.send(message);
      console.log('Successfully sent message:', response);
      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
}
