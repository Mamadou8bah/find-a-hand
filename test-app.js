#!/usr/bin/env node

/**
 * Find-A-Hand Application Test Script
 * Tests all major functionality of the application
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'TestPassword123';

class AppTester {
  constructor() {
    this.results = [];
    this.token = null;
  }

  async log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type];
    
    console.log(`${emoji} ${timestamp} - ${message}`);
    this.results.push({ timestamp, type, message });
  }

  async testHealthCheck() {
    try {
      const response = await axios.get(`${BASE_URL}/health`);
      if (response.status === 200) {
        await this.log('Health check passed', 'success');
        return true;
      }
    } catch (error) {
      await this.log(`Health check failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testDatabaseConnection() {
    try {
      const response = await axios.get(`${BASE_URL}/db-test`);
      if (response.status === 200) {
        await this.log('Database connection test passed', 'success');
        return true;
      }
    } catch (error) {
      await this.log(`Database connection test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testAPIEndpoints() {
    const endpoints = [
      '/test',
      '/cors-test',
      '/env-check',
      '/login-test'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${BASE_URL}${endpoint}`);
        if (response.status === 200) {
          await this.log(`API endpoint ${endpoint} working`, 'success');
        }
      } catch (error) {
        await this.log(`API endpoint ${endpoint} failed: ${error.message}`, 'error');
      }
    }
  }

  async testHandymanRegistration() {
    try {
      const handymanData = {
        firstName: 'Test',
        lastName: 'Handyman',
        email: TEST_EMAIL,
        phone: '+1234567890',
        location: 'Test City',
        password: TEST_PASSWORD,
        profession: 'Plumber',
        skills: ['Plumbing', 'Repairs'],
        experience: 5,
        hourlyRate: 50
      };

      const response = await axios.post(`${BASE_URL}/api/handymen/register`, handymanData);
      
      if (response.status === 200 && response.data.token) {
        this.token = response.data.token;
        await this.log('Handyman registration test passed', 'success');
        return true;
      }
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        await this.log('Handyman already exists (expected)', 'warning');
        return true;
      }
      await this.log(`Handyman registration test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testHandymanLogin() {
    try {
      const loginData = {
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      };

      const response = await axios.post(`${BASE_URL}/api/handymen/login`, loginData);
      
      if (response.status === 200 && response.data.token) {
        this.token = response.data.token;
        await this.log('Handyman login test passed', 'success');
        return true;
      }
    } catch (error) {
      await this.log(`Handyman login test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testProtectedEndpoints() {
    if (!this.token) {
      await this.log('No token available for protected endpoint tests', 'warning');
      return;
    }

    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };

    try {
      // Test getting handyman profile
      const response = await axios.get(`${BASE_URL}/api/handymen/me`, { headers });
      if (response.status === 200) {
        await this.log('Protected endpoint /api/handymen/me working', 'success');
      }
    } catch (error) {
      await this.log(`Protected endpoint test failed: ${error.message}`, 'error');
    }
  }

  async testFileUpload() {
    try {
      // Test if uploads directory exists and is accessible
      const response = await axios.get(`${BASE_URL}/uploads/`);
      if (response.status === 200) {
        await this.log('File upload directory accessible', 'success');
      }
    } catch (error) {
      await this.log(`File upload test failed: ${error.message}`, 'error');
    }
  }

  async testFrontendPages() {
    const pages = [
      '/',
      '/login',
      '/signup',
      '/search-handyman',
      '/handyman-dashboard',
      '/customer-dashboard'
    ];

    for (const page of pages) {
      try {
        const response = await axios.get(`${BASE_URL}${page}`);
        if (response.status === 200) {
          await this.log(`Frontend page ${page} accessible`, 'success');
        }
      } catch (error) {
        await this.log(`Frontend page ${page} failed: ${error.message}`, 'error');
      }
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Find-A-Hand Application Tests...\n');

    await this.log('Starting comprehensive application test', 'info');

    // Core functionality tests
    await this.testHealthCheck();
    await this.testDatabaseConnection();
    await this.testAPIEndpoints();

    // Authentication tests
    await this.testHandymanRegistration();
    await this.testHandymanLogin();
    await this.testProtectedEndpoints();

    // File system tests
    await this.testFileUpload();

    // Frontend tests
    await this.testFrontendPages();

    // Summary
    const successCount = this.results.filter(r => r.type === 'success').length;
    const errorCount = this.results.filter(r => r.type === 'error').length;
    const warningCount = this.results.filter(r => r.type === 'warning').length;

    console.log('\n📊 Test Summary:');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`⚠️ Warnings: ${warningCount}`);
    console.log(`📝 Total Tests: ${this.results.length}`);

    if (errorCount === 0) {
      console.log('\n🎉 All tests passed! Application is ready for production!');
    } else {
      console.log('\n⚠️ Some tests failed. Please review the errors above.');
    }

    console.log('\n📋 Detailed Results:');
    this.results.forEach(result => {
      const emoji = { info: 'ℹ️', success: '✅', error: '❌', warning: '⚠️' }[result.type];
      console.log(`${emoji} ${result.message}`);
    });
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new AppTester();
  tester.runAllTests().catch(error => {
    console.error('❌ Test runner failed:', error.message);
    process.exit(1);
  });
}

module.exports = AppTester; 