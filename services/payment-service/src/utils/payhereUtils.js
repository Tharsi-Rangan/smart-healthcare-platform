import crypto from 'crypto';

/**
 * Validate PayHere webhook signature
 * PayHere sends a hash that we need to verify
 */
export const validatePayhereSignature = (req) => {
  try {
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || '';
    if (!merchantSecret) {
      console.warn('[PayHere] No merchant secret configured - skipping signature validation');
      return true; // Allow for development without secret
    }

    const { merchant_id, order_id, status_code, payhere_amount, payhere_currency } = req.body;
    
    // PayHere verification formula
    const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    const hashString = `${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${hashedSecret}`;
    const expectedHash = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();
    
    const receivedHash = req.body.md5sig?.toUpperCase() || '';
    
    return expectedHash === receivedHash;
  } catch (error) {
    console.error('[PayHere] Signature validation error:', error);
    return false;
  }
};

/**
 * Get PayHere status message
 */
export const getPayhereStatusMessage = (statusCode) => {
  const statusMap = {
    '0': 'Invalid transaction',
    '1': 'Authorized/Pending',
    '2': 'Completed',
    '-1': 'Canceled',
    '-2': 'Failed',
    '-3': 'Chargebacked',
  };
  return statusMap[statusCode] || 'Unknown status';
};

/**
 * Format PayHere amount (convert from cents if needed)
 */
export const formatPayhereAmount = (amount) => {
  // PayHere returns amount in LKR with decimals
  return parseFloat(amount).toFixed(2);
};
