// Simple test script to verify KMS functionality
const { KeyManagementServiceClient } = require('@google-cloud/kms');

async function testKMSAccess() {
  console.log('🔐 Testing KMS Access...');
  
  try {
    // Initialize KMS client
    const client = new KeyManagementServiceClient();
    
    // Configuration
    const projectId = 'claude-code-meno-app';
    const locationId = 'northamerica-northeast2';
    const keyRingId = 'app-backend-meno-apps';
    
    console.log(`📍 Project: ${projectId}`);
    console.log(`📍 Location: ${locationId}`);
    console.log(`📍 Key Ring: ${keyRingId}`);
    
    // Test 1: List keys in the keyring
    console.log('\n🔍 Testing key listing...');
    const keyRingName = client.keyRingPath(projectId, locationId, keyRingId);
    const [keys] = await client.listCryptoKeys({
      parent: keyRingName,
    });
    
    console.log(`✅ Found ${keys.length} keys:`);
    keys.forEach(key => {
      const keyName = key.name.split('/').pop();
      console.log(`  - ${keyName} (${key.purpose})`);
    });
    
    // Test 2: Test encryption/decryption with meno-wellness key
    console.log('\n🔐 Testing encryption/decryption...');
    const menoKeyName = client.cryptoKeyPath(
      projectId,
      locationId,
      keyRingId,
      'meno-app-encryption-key'
    );
    
    // Test data
    const testData = Buffer.from('Hello, MenoWellness KMS!');
    console.log(`📝 Test data: "${testData.toString()}"`);
    
    // Encrypt
    const [encryptResult] = await client.encrypt({
      name: menoKeyName,
      plaintext: testData,
    });
    
    console.log('✅ Encryption successful');
    console.log(`📦 Ciphertext length: ${encryptResult.ciphertext.length} bytes`);
    
    // Decrypt
    const [decryptResult] = await client.decrypt({
      name: menoKeyName,
      ciphertext: encryptResult.ciphertext,
    });
    
    const decryptedText = Buffer.from(decryptResult.plaintext).toString();
    console.log(`🔓 Decrypted: "${decryptedText}"`);
    
    if (decryptedText === testData.toString()) {
      console.log('✅ Encryption/Decryption test PASSED');
    } else {
      console.log('❌ Encryption/Decryption test FAILED');
      return false;
    }
    
    // Test 3: Test partner support key
    console.log('\n🤝 Testing partner support key...');
    const partnerKeyName = client.cryptoKeyPath(
      projectId,
      locationId,
      keyRingId,
      'support-partner-app-encryption-key'
    );
    
    const partnerTestData = Buffer.from('Hello, Partner Support KMS!');
    
    const [partnerEncryptResult] = await client.encrypt({
      name: partnerKeyName,
      plaintext: partnerTestData,
    });
    
    const [partnerDecryptResult] = await client.decrypt({
      name: partnerKeyName,
      ciphertext: partnerEncryptResult.ciphertext,
    });
    
    const partnerDecryptedText = Buffer.from(partnerDecryptResult.plaintext).toString();
    
    if (partnerDecryptedText === partnerTestData.toString()) {
      console.log('✅ Partner Support key test PASSED');
    } else {
      console.log('❌ Partner Support key test FAILED');
      return false;
    }
    
    console.log('\n🎉 All KMS tests PASSED!');
    console.log('✅ KMS integration is working correctly');
    return true;
    
  } catch (error) {
    console.error('❌ KMS test failed:', error.message);
    console.error('🔍 Error details:', error);
    return false;
  }
}

// Run the test
testKMSAccess()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
