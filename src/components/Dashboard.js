import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [investments, setInvestments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState('Stock');
  const [amount, setAmount] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [dateInvested, setDateInvested] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const headers = { 
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
   };
  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/investments', { headers });
      setInvestments(response.data);
    } catch (err) {
      if (err.response?.status === 403) {
        navigate('/login');
      }
    }
  };

  const handleAddInvestment = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/investments', {
        type,
        amount: parseFloat(amount),
        currentValue: parseFloat(currentValue),
        dateInvested,
        user: { id: 1 }
      }, { headers });
      setShowForm(false);
      setAmount('');
      setCurrentValue('');
      setDateInvested('');
      fetchInvestments();
    } catch (err) {
      alert('Failed to add investment');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/investments/${id}`, { headers });
      fetchInvestments();
    } catch (err) {
      alert('Failed to delete investment');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalReturns = totalCurrentValue - totalInvested;
  const returnsPercent = totalInvested > 0 ? ((totalReturns / totalInvested) * 100).toFixed(2) : 0;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>📈 Portfolio Tracker</h2>
        <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>

      {/* Summary Cards */}
      <div style={styles.summaryContainer}>
        <div style={styles.summaryCard}>
          <p style={styles.summaryLabel}>Total Invested</p>
          <p style={styles.summaryValue}>₹{totalInvested.toLocaleString()}</p>
        </div>
        <div style={styles.summaryCard}>
          <p style={styles.summaryLabel}>Current Value</p>
          <p style={styles.summaryValue}>₹{totalCurrentValue.toLocaleString()}</p>
        </div>
        <div style={{...styles.summaryCard, backgroundColor: totalReturns >= 0 ? '#e6f4ea' : '#fce8e6'}}>
          <p style={styles.summaryLabel}>Total Returns</p>
          <p style={{...styles.summaryValue, color: totalReturns >= 0 ? '#34a853' : '#ea4335'}}>
            {totalReturns >= 0 ? '+' : ''}₹{totalReturns.toLocaleString()} ({returnsPercent}%)
          </p>
        </div>
      </div>

      {/* Add Investment Button */}
      <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : '+ Add Investment'}
      </button>

      {/* Add Investment Form */}
      {showForm && (
        <div style={styles.form}>
          <h3>Add New Investment</h3>
          <form onSubmit={handleAddInvestment}>
            <select style={styles.input} value={type} onChange={(e) => setType(e.target.value)}>
              <option value="Stock">Stock</option>
              <option value="Mutual Fund">Mutual Fund</option>
              <option value="SIP">SIP</option>
            </select>
            <input style={styles.input} type="number" placeholder="Amount Invested (₹)" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            <input style={styles.input} type="number" placeholder="Current Value (₹)" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} required />
            <input style={styles.input} type="date" value={dateInvested} onChange={(e) => setDateInvested(e.target.value)} required />
            <button style={styles.submitBtn} type="submit">Add Investment</button>
          </form>
        </div>
      )}

      {/* Investments Table */}
      <div style={styles.tableContainer}>
        <h3>My Investments</h3>
        {investments.length === 0 ? (
          <p style={styles.noData}>No investments yet. Add your first investment!</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Current Value</th>
                <th style={styles.th}>Returns</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {investments.map((inv) => {
                const returns = inv.currentValue - inv.amount;
                const percent = ((returns / inv.amount) * 100).toFixed(2);
                return (
                  <tr key={inv.id} style={styles.tableRow}>
                    <td style={styles.td}>{inv.type}</td>
                    <td style={styles.td}>₹{inv.amount.toLocaleString()}</td>
                    <td style={styles.td}>₹{inv.currentValue.toLocaleString()}</td>
                    <td style={{...styles.td, color: returns >= 0 ? '#34a853' : '#ea4335'}}>
                      {returns >= 0 ? '+' : ''}₹{returns.toLocaleString()} ({percent}%)
                    </td>
                    <td style={styles.td}>{inv.dateInvested}</td>
                    <td style={styles.td}>
                      <button style={styles.deleteBtn} onClick={() => handleDelete(inv.id)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '15px 25px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  headerTitle: { color: '#1a73e8', margin: 0 },
  logoutBtn: { padding: '8px 16px', backgroundColor: '#ea4335', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  summaryContainer: { display: 'flex', gap: '20px', marginBottom: '20px' },
  summaryCard: { flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  summaryLabel: { color: '#666', margin: '0 0 5px 0', fontSize: '14px' },
  summaryValue: { color: '#333', margin: 0, fontSize: '24px', fontWeight: 'bold' },
  addBtn: { padding: '12px 24px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', marginBottom: '20px' },
  form: { backgroundColor: 'white', padding: '25px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  input: { width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  submitBtn: { padding: '10px 20px', backgroundColor: '#34a853', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  tableContainer: { backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: { backgroundColor: '#f8f9fa' },
  th: { padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6', color: '#666' },
  tableRow: { borderBottom: '1px solid #dee2e6' },
  td: { padding: '12px', fontSize: '14px' },
  deleteBtn: { padding: '5px 10px', backgroundColor: '#ea4335', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' },
  noData: { color: '#666', textAlign: 'center', padding: '20px' }
};

export default Dashboard;