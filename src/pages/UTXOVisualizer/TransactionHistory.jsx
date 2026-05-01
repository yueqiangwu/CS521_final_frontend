import React from 'react';
import { Card, List, Typography, Tag } from 'antd';

const { Text } = Typography;

export default function TransactionHistory({ history }) {
  return (
    <Card
      title={<span style={{ color: '#fff' }}>📜 History</span>}
      size="small"
    >
      <List
        dataSource={history}
        renderItem={item => (
          <List.Item style={{ borderBottom: '1px solid #303030', padding: '12px 0' }}>
            <div style={{ width: '100%' }}>
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#666' }}>{item.txid_short}</div>
              <div style={{ margin: '4px 0' }}>
                <Tag color="default">In</Tag> → <Tag color="green">Out</Tag>
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>Fee: {item.fee} sat</Text>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
}