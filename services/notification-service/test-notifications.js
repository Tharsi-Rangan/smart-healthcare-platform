#!/usr/bin/env node

/**
 * Test Script for Notification Service
 * Tests email and SMS functionality
 */

import dotenv from 'dotenv';
dotenv.config();

import { sendEmail, appointmentBookedTemplate, paymentReceivedTemplate } from './src/services/emailService.js';
import { sendSMS, appointmentBookedSMS, paymentReceivedSMS } from './src/services/smsService.js';

const testEmail = process.env.EMAIL_USER || 'your-email@gmail.com';
const testPhone = process.env.TWILIO_PHONE_NUMBER || '+94771234567';

console.log('\n🧪 NOTIFICATION SERVICE TEST SCRIPT\n');
console.log('========================================\n');

// Test 1: Email Configuration
console.log('📧 TEST 1: Email Configuration');
console.log('--------------------------------');
console.log(`Email User: ${process.env.EMAIL_USER}`);
console.log(`Email Pass: ${process.env.EMAIL_PASS ? '✓ Configured' : '✗ Missing'}`);
console.log(`Email From: ${process.env.EMAIL_FROM_NAME}`);
console.log('');

// Test 2: SMS Configuration
console.log('📱 TEST 2: SMS Configuration');
console.log('--------------------------------');
console.log(`Twilio Account SID: ${process.env.TWILIO_ACCOUNT_SID ? '✓ Configured' : '✗ Missing'}`);
console.log(`Twilio Auth Token: ${process.env.TWILIO_AUTH_TOKEN ? '✓ Configured' : '✗ Missing'}`);
console.log(`Twilio Phone: ${process.env.TWILIO_PHONE_NUMBER}`);
console.log('');

// Test 3: Send Test Email
console.log('✉️  TEST 3: Send Test Email');
console.log('--------------------------------');
const testEmailTemplate = appointmentBookedTemplate(
  'Test Patient',
  'Dr. Smith',
  '2026-04-25',
  '2:00 PM'
);
console.log(`Subject: ${testEmailTemplate.subject}`);
console.log(`Recipient: ${testEmail}`);

(async () => {
  try {
    const emailResult = await sendEmail(
      testEmail,
      testEmailTemplate.subject,
      testEmailTemplate.html
    );
    
    if (emailResult.success) {
      console.log(`✅ Email Sent! Message ID: ${emailResult.messageId}`);
    } else {
      console.log(`❌ Email Failed: ${emailResult.error}`);
    }
  } catch (error) {
    console.log(`❌ Email Error: ${error.message}`);
  }
  
  console.log('');
  
  // Test 4: Send Test SMS
  console.log('📱 TEST 4: Send Test SMS');
  console.log('--------------------------------');
  const testSMS = appointmentBookedSMS('Dr. Smith', '2026-04-25', '2:00 PM');
  console.log(`Message: ${testSMS}`);
  console.log(`Recipient: ${testPhone}`);
  
  try {
    const smsResult = await sendSMS(testPhone, testSMS);
    
    if (smsResult.success) {
      if (smsResult.mock) {
        console.log(`⚠️  SMS Mock Mode (Twilio not configured): ${smsResult.sid}`);
      } else {
        console.log(`✅ SMS Sent! SID: ${smsResult.sid}`);
      }
    } else {
      console.log(`❌ SMS Failed: ${smsResult.error}`);
    }
  } catch (error) {
    console.log(`❌ SMS Error: ${error.message}`);
  }
  
  console.log('');
  console.log('========================================\n');
  console.log('✅ TESTS COMPLETE\n');
  console.log('Next steps:');
  console.log('1. Check your email inbox (or spam folder)');
  console.log('2. Verify SMS received on your phone');
  console.log('3. Run: npm run dev');
  console.log('4. Test via API endpoint\n');
  
  process.exit(0);
})();
