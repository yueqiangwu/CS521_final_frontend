import { List, Card, Collapse, Typography, Space, Tag, Tooltip } from 'antd';

const { Text } = Typography;

export default function Stack({ title, stack }) {
  const data = [{
    key: '1',
    children: (
      <List
        dataSource={stack}
        renderItem={(item, index) => {
          const itemStr = item || "00";

          return (
            <List.Item style={{ padding: '5px 10px' }}>
              <Tag color="blue">Index {index}</Tag>
              <Tooltip color="#ffffff" title={<Text copyable>{itemStr}</Text>}>
                <Text code ellipsis style={{ maxWidth: '270px' }}>{itemStr}</Text>
              </Tooltip>
            </List.Item>
          );
        }}
      />
    ),
  }];

  const defaultActiveKey = title === "Stack" ? ['1'] : []

  return (
    <Space vertical style={{ width: "100%" }}>
      <Card title={title} size="small">
        <Collapse size="small" items={data} defaultActiveKey={defaultActiveKey} />
      </Card>
    </Space>
  );
}