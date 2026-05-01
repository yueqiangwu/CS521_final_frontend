import React, { useState, useMemo } from 'react';
import { Card, Button, InputNumber, Select, Space, Divider, Tag, Alert, Form, Empty } from 'antd';
import { RocketOutlined, PlusOutlined, DeleteOutlined, WalletOutlined } from '@ant-design/icons';

const { Option } = Select;

export default function TransactionBuilder({ selectedInputs, outputs, setOutputs, onSend }) {
  const [form] = Form.useForm();
  const [outType, setOutType] = useState('P2PKH');

  const ACCOUNTS = ['Alice', 'Bob', 'Charlie'];

  const totalIn = useMemo(() =>
    Object.values(selectedInputs).reduce((sum, u) => sum + u.amount, 0),
    [selectedInputs]);

  const totalOut = useMemo(() =>
    outputs.reduce((sum, o) => sum + o.amount, 0),
    [outputs]);

  const fee = totalIn - totalOut;

  const addOutput = (values) => {
    const isMultisig = ['P2SH', 'P2WSH'].includes(values.script_type);

    const newOutput = {
      key: Date.now(),
      amount: parseInt(values.amount),
      script_type: values.script_type,
    };

    if (isMultisig) {
      newOutput.m = values.m;
      newOutput.multisig_signers = values.multisig_signers;
    } else {
      newOutput.recipient = values.recipient;
    }

    setOutputs([...outputs, newOutput]);
    form.resetFields(['amount']);
  };

  const removeOutput = (key) => {
    setOutputs(outputs.filter(o => o.key !== key));
  };

  const addChangeOutput = () => {
    if (fee <= 0) return;
    const firstInput = Object.values(selectedInputs)[0];

    const changeOutput = {
      key: Date.now(),
      amount: fee,
      recipient: firstInput.owner.split(' ')[0],
      script_type: firstInput.type === 'P2WPKH' ? 'P2WPKH' : 'P2PKH'
    };
    setOutputs([...outputs, changeOutput]);
  };

  return (
    <Card
      title={<span style={{ color: '#fff' }}><WalletOutlined /> Transaction Builder</span>}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: '#888', fontSize: '12px', marginBottom: 8 }}>INPUTS FROM POOL</div>
        {Object.keys(selectedInputs).length > 0 ? (
          Object.values(selectedInputs).map(u => (
            <Tag color="blue" key={`${u.txid}-${u.vout}`} style={{ marginBottom: 6 }}>
              {u.owner}: {u.amount.toLocaleString()} sat
            </Tag>
          ))
        ) : (
          <div style={{ color: '#444', fontSize: '12px' }}>No inputs selected. Click UTXOs on the left.</div>
        )}
      </div>

      <Divider style={{ margin: '12px 0' }} />

      <Form form={form} layout="vertical" onFinish={addOutput} initialValues={{ script_type: 'P2PKH', recipient: 'Alice', m: 2 }}>
        <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Form.Item name="script_type" label="Type" style={{ width: 100 }}>
            <Select onChange={(val) => setOutType(val)}>
              <Option value="P2PKH">P2PKH</Option>
              <Option value="P2WPKH">P2WPKH</Option>
              <Option value="P2SH">P2SH (MS)</Option>
              <Option value="P2WSH">P2WSH (MS)</Option>
            </Select>
          </Form.Item>

          {!['P2SH', 'P2WSH'].includes(outType) ? (
            <Form.Item name="recipient" label="To" style={{ width: 100 }}>
              <Select>
                {ACCOUNTS.map(a => <Option key={a} value={a}>{a}</Option>)}
              </Select>
            </Form.Item>
          ) : (
            <>
              <Form.Item name="m" label="M" style={{ width: 60 }}>
                <InputNumber min={1} max={3} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="multisig_signers" label="Signers" style={{ width: 120 }}>
                <Select mode="multiple" maxTagCount="responsive">
                  {ACCOUNTS.map(a => <Option key={a} value={a}>{a}</Option>)}
                </Select>
              </Form.Item>
            </>
          )}

          <Form.Item name="amount" label="Amount (sat)" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: 120 }} placeholder="0" />
          </Form.Item>

          <Button type="primary" icon={<PlusOutlined />} htmlType="submit" style={{ marginTop: 30 }} />
        </Space>
      </Form>

      <div style={{ padding: '8px', borderRadius: '4px', marginTop: 12 }}>
        {outputs.length > 0 ? (
          outputs.map((o) => (
            <div key={o.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #262626' }}>
              <span style={{ fontSize: '13px' }}>
                <Tag color="cyan" style={{ fontSize: '10px' }}>{o.script_type}</Tag>
                {o.recipient || `${o.m}-of-${o.multisig_signers?.length}`}
              </span>
              <span>
                <b style={{ color: '#faad14' }}>{o.amount.toLocaleString()}</b> <small>sat</small>
                <Button type="text" danger icon={<DeleteOutlined />} size="small" onClick={() => removeOutput(o.key)} />
              </span>
            </div>
          ))
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span style={{ color: '#444' }}>No outputs</span>} />
        )}
      </div>

      <div style={{ marginTop: 20, padding: '12px', border: '1px dashed #303030' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ color: '#888' }}>Total In:</span> <span>{totalIn.toLocaleString()} sat</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ color: '#888' }}>Total Out:</span> <span>{totalOut.toLocaleString()} sat</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <span style={{ color: '#888' }}>Fee:</span>
          <span style={{ color: fee < 0 ? '#ff4d4f' : '#52c41a' }}>{fee.toLocaleString()} sat</span>
        </div>
      </div>

      {fee > 0 && outputs.length > 0 && (
        <Alert
          style={{ marginTop: 12 }}
          message={`${fee.toLocaleString()} sat will be lost as fee.`}
          type="warning"
          showIcon
          action={<Button size="small" type="link" onClick={addChangeOutput}>Add Change</Button>}
        />
      )}

      <Button
        type="primary"
        block
        size="large"
        icon={<RocketOutlined />}
        style={{ marginTop: 16, height: '50px', fontWeight: 'bold' }}
        disabled={fee < 0 || totalIn === 0 || outputs.length === 0}
        onClick={onSend}
      >
        SEND TRANSACTION
      </Button>
    </Card>
  );
}