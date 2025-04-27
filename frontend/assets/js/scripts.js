document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    document.body.setAttribute('data-theme', currentTheme);
    
    themeToggle.addEventListener('click', () => {
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.body.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
    
    // Auth forms
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          
          const data = await response.json();
          
          if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/dashboard.html';
          } else {
            alert(data.error || 'Login failed');
          }
        } catch (error) {
          console.error('Login error:', error);
          alert('Login failed. Please try again.');
        }
      });
    }
    
    if (signupForm) {
      signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        
        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
          });
          
          const data = await response.json();
          
          if (response.ok) {
            alert('Registration successful! Please check your email for verification.');
            window.location.href = '/login.html';
          } else {
            alert(data.error || 'Registration failed');
          }
        } catch (error) {
          console.error('Registration error:', error);
          alert('Registration failed. Please try again.');
        }
      });
    }
    
    // Load user data on dashboard
    const dashboardUsername = document.getElementById('dashboard-username');
    const dashboardBalance = document.getElementById('dashboard-balance');
    
    if (dashboardUsername && dashboardBalance) {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      
      if (!user || !token) {
        window.location.href = '/login.html';
        return;
      }
      
      dashboardUsername.textContent = user.username;
      
      // Fetch user balance
      fetch('/api/user/balance', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(response => response.json())
      .then(data => {
        if (data.balance !== undefined) {
          dashboardBalance.textContent = `$${data.balance.toFixed(2)}`;
        }
      })
      .catch(error => {
        console.error('Error fetching balance:', error);
      });
    }
    
    // Payment form
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
      const cryptoOptions = document.querySelectorAll('.crypto-option');
      let selectedCrypto = 'btc';
      
      cryptoOptions.forEach(option => {
        option.addEventListener('click', () => {
          cryptoOptions.forEach(opt => opt.classList.remove('active'));
          option.classList.add('active');
          selectedCrypto = option.dataset.crypto;
        });
      });
      
      paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const amount = document.getElementById('payment-amount').value;
        const plan = document.getElementById('payment-plan').value;
        const token = localStorage.getItem('token');
        
        if (!token) {
          window.location.href = '/login.html';
          return;
        }
        
        try {
          const response = await fetch('/api/payment/deposit', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
              amount, 
              currency: selectedCrypto === 'btc' ? 'BTC' : 'USD',
              plan 
            })
          });
          
          const data = await response.json();
          
          if (response.ok) {
            alert('Deposit request created. Please send the crypto to the provided address.');
            window.location.href = '/dashboard.html';
          } else {
            alert(data.error || 'Deposit failed');
          }
        } catch (error) {
          console.error('Deposit error:', error);
          alert('Deposit failed. Please try again.');
        }
      });
    }
    
    // Withdrawal form
    const withdrawalForm = document.getElementById('withdrawal-form');
    if (withdrawalForm) {
      withdrawalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const amount = document.getElementById('withdrawal-amount').value;
        const walletAddress = document.getElementById('withdrawal-address').value;
        const token = localStorage.getItem('token');
        
        if (!token) {
          window.location.href = '/login.html';
          return;
        }
        
        try {
          const response = await fetch('/api/payment/withdraw', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
              amount, 
              currency: 'USD',
              walletAddress 
            })
          });
          
          const data = await response.json();
          
          if (response.ok) {
            alert('Withdrawal request submitted. It will be processed shortly.');
            window.location.href = '/dashboard.html';
          } else {
            alert(data.error || 'Withdrawal failed');
          }
        } catch (error) {
          console.error('Withdrawal error:', error);
          alert('Withdrawal failed. Please try again.');
        }
      });
    }
    
    // Load transactions
    const transactionsTable = document.getElementById('transactions-table');
    if (transactionsTable) {
      const token = localStorage.getItem('token');
      
      if (!token) {
        window.location.href = '/login.html';
        return;
      }
      
      fetch('/api/payment/transactions', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(response => response.json())
      .then(transactions => {
        const tbody = transactionsTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        transactions.forEach(tx => {
          const row = document.createElement('tr');
          
          row.innerHTML = `
            <td>${new Date(tx.created_at).toLocaleString()}</td>
            <td>${tx.type}</td>
            <td>${tx.amount} ${tx.currency}</td>
            <td>${tx.plan || '-'}</td>
            <td><span class="status status-${tx.status}">${tx.status}</span></td>
          `;
          
          tbody.appendChild(row);
        });
      })
      .catch(error => {
        console.error('Error fetching transactions:', error);
      });
    }
    
    // Admin functionality
    const adminLoginForm = document.getElementById('admin-login-form');
    if (adminLoginForm) {
      adminLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('admin-username').value;
        const password = document.getElementById('admin-password').value;
        
        try {
          const response = await fetch('/api/auth/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
          });
          
          const data = await response.json();
          
          if (response.ok) {
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('admin', JSON.stringify(data.admin));
            window.location.href = '/admin.html';
          } else {
            alert(data.error || 'Admin login failed');
          }
        } catch (error) {
          console.error('Admin login error:', error);
          alert('Admin login failed. Please try again.');
        }
      });
    }
    
    // Admin page transactions
    const adminTransactionsTable = document.getElementById('admin-transactions-table');
    if (adminTransactionsTable) {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        window.location.href = '/admin-login.html';
        return;
      }
      
      fetch('/api/admin/transactions', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(response => response.json())
      .then(transactions => {
        const tbody = adminTransactionsTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        transactions.forEach(tx => {
          const row = document.createElement('tr');
          
          row.innerHTML = `
            <td>${tx.id}</td>
            <td>${tx.user_id}</td>
            <td>${new Date(tx.created_at).toLocaleString()}</td>
            <td>${tx.type}</td>
            <td>${tx.amount} ${tx.currency}</td>
            <td>${tx.plan || '-'}</td>
            <td><span class="status status-${tx.status}">${tx.status}</span></td>
            <td>
              <button class="btn btn-primary btn-sm approve-btn" data-id="${tx.id}">Approve</button>
              <button class="btn btn-danger btn-sm reject-btn" data-id="${tx.id}">Reject</button>
            </td>
          `;
          
          tbody.appendChild(row);
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('.approve-btn').forEach(btn => {
          btn.addEventListener('click', async () => {
            const txId = btn.dataset.id;
            
            try {
              const response = await fetch(`/api/admin/transactions/${txId}`, {
                method: 'PUT',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'approved' })
              });
              
              if (response.ok) {
                alert('Transaction approved');
                window.location.reload();
              } else {
                const data = await response.json();
                alert(data.error || 'Approval failed');
              }
            } catch (error) {
              console.error('Approval error:', error);
              alert('Approval failed. Please try again.');
            }
          });
        });
        
        document.querySelectorAll('.reject-btn').forEach(btn => {
          btn.addEventListener('click', async () => {
            const txId = btn.dataset.id;
            
            try {
              const response = await fetch(`/api/admin/transactions/${txId}`, {
                method: 'PUT',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'rejected' })
              });
              
              if (response.ok) {
                alert('Transaction rejected');
                window.location.reload();
              } else {
                const data = await response.json();
                alert(data.error || 'Rejection failed');
              }
            } catch (error) {
              console.error('Rejection error:', error);
              alert('Rejection failed. Please try again.');
            }
          });
        });
      })
      .catch(error => {
        console.error('Error fetching admin transactions:', error);
      });
    }
    
    // Support chat
    const supportForm = document.getElementById('support-form');
    const chatMessages = document.getElementById('chat-messages');
    
    if (supportForm && chatMessages) {
      const token = localStorage.getItem('token');
      
      if (!token) {
        window.location.href = '/login.html';
        return;
      }
      
      // Load chat history
      fetch('/api/support/messages', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(response => response.json())
      .then(messages => {
        messages.forEach(msg => {
          const messageDiv = document.createElement('div');
          messageDiv.className = `message ${msg.is_admin ? 'admin-message' : 'user-message'}`;
          messageDiv.innerHTML = `
            <p>${msg.message}</p>
            <small>${new Date(msg.created_at).toLocaleString()}</small>
          `;
          chatMessages.appendChild(messageDiv);
        });
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
      })
      .catch(error => {
        console.error('Error fetching messages:', error);
      });
      
      // Send new message
      supportForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const messageInput = document.getElementById('support-message');
        const message = messageInput.value.trim();
        
        if (!message) return;
        
        try {
          const response = await fetch('/api/support/messages', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message })
          });
          
          if (response.ok) {
            messageInput.value = '';
            const data = await response.json();
            
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message user-message';
            messageDiv.innerHTML = `
              <p>${message}</p>
              <small>Just now</small>
            `;
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
          } else {
            const data = await response.json();
            alert(data.error || 'Failed to send message');
          }
        } catch (error) {
          console.error('Error sending message:', error);
          alert('Failed to send message. Please try again.');
        }
      });
    }
    
    // Admin support chat
    const adminChatMessages = document.getElementById('admin-chat-messages');
    const adminSupportForm = document.getElementById('admin-support-form');
    
    if (adminChatMessages && adminSupportForm) {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        window.location.href = '/admin-login.html';
        return;
      }
      
      // Load all chat messages
      fetch('/api/admin/support/messages', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(response => response.json())
      .then(messages => {
        messages.forEach(msg => {
          const messageDiv = document.createElement('div');
          messageDiv.className = `message ${msg.is_admin ? 'admin-message' : 'user-message'}`;
          messageDiv.innerHTML = `
            <p><strong>${msg.is_admin ? 'Admin' : `User ${msg.user_id}`}:</strong> ${msg.message}</p>
            <small>${new Date(msg.created_at).toLocaleString()}</small>
          `;
          adminChatMessages.appendChild(messageDiv);
        });
        
        adminChatMessages.scrollTop = adminChatMessages.scrollHeight;
      })
      .catch(error => {
        console.error('Error fetching admin messages:', error);
      });
      
      // Send admin reply
      adminSupportForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userIdInput = document.getElementById('admin-support-user-id');
        const messageInput = document.getElementById('admin-support-message');
        const userId = userIdInput.value.trim();
        const message = messageInput.value.trim();
        
        if (!userId || !message) return;
        
        try {
          const response = await fetch('/api/admin/support/messages', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId, message })
          });
          
          if (response.ok) {
            messageInput.value = '';
            const data = await response.json();
            
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message admin-message';
            messageDiv.innerHTML = `
              <p><strong>Admin:</strong> ${message}</p>
              <small>Just now</small>
            `;
            adminChatMessages.appendChild(messageDiv);
            adminChatMessages.scrollTop = adminChatMessages.scrollHeight;
          } else {
            const data = await response.json();
            alert(data.error || 'Failed to send message');
          }
        } catch (error) {
          console.error('Error sending admin message:', error);
          alert('Failed to send message. Please try again.');
        }
      });
    }
    
    // Logout functionality
    const logoutButtons = document.querySelectorAll('.logout-btn');
    logoutButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
        window.location.href = '/login.html';
      });
    });
    
    // Admin logout
    const adminLogoutButtons = document.querySelectorAll('.admin-logout-btn');
    adminLogoutButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
        window.location.href = '/admin-login.html';
      });
    });
  });