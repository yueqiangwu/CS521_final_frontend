import React from 'react';
import { Card, Badge, List, Typography } from 'antd';

const { Text } = Typography;

export default function UTXOPool({ utxos, selectedInputs, onToggle }) {
  return (
    <Card 
      title={<span style={{color: '#fff'}}>💰 UTXO Pool</span>} 
      extra={<Badge count="100,000 sat" style={{ backgroundColor: '#52c41a' }} />}
    >
      <Text type="secondary" size="small">Click a UTXO to add it as an input</Text>
      <List
        dataSource={utxos}
        renderItem={u => (
          <Card.Grid 
            style={{ width: '100%', padding: '12px', cursor: 'pointer', background: selectedInputs[u.id] ? '#111' : 'transparent' }}
            onClick={() => onToggle(u)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Badge status="processing" text={<span style={{color: '#aaa'}}>{u.owner}</span>} />
              <Badge color="blue" count={u.script_type} />
            </div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: 8 }}>
              {u.amount.toLocaleString()} <small style={{fontWeight: 'normal', fontSize: 12}}>sat</small>
            </div>
            <Text style={{ fontSize: 10, fontFamily: 'monospace' }} type="secondary">{u.txid_short} #0</Text>
          </Card.Grid>
        )}
      />
    </Card>
  );
}