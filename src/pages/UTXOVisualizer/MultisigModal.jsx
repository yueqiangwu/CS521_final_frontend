import React from 'react';
import { Modal, Form, Select, Checkbox, InputNumber, Alert } from 'antd';

export default function MultisigModal({ visible, onCancel, onCreate }) {
  const [form] = Form.useForm();
  const accounts = ['Alice', 'Bob', 'Charlie'];

  return (
    <Modal
      title="🔐 Create Multisig UTXO"
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Create"
    >
      <Form form={form} layout="vertical" onFinish={onCreate} initialValues={{ m: 2, type: 'P2SH' }}>
        <Form.Item name="type" label="Script Type">
          <Select>
            <Select.Option value="P2SH">P2SH (Legacy)</Select.Option>
            <Select.Option value="P2WSH">P2WSH (SegWit)</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Co-signers" name="signers">
          <Checkbox.Group options={accounts} />
        </Form.Item>

        <Form.Item name="m" label="Threshold (M)">
          <InputNumber min={1} max={3} />
        </Form.Item>

        <Form.Item name="amount" label="Amount (sat)">
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>

        <Alert message="Signing will be automatic for visualizer demo." type="info" showIcon />
      </Form>
    </Modal>
  );
}