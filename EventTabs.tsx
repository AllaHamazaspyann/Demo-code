import React from 'react';
import { Card, Tab, Row, Col, Nav } from 'react-bootstrap';
import { TabInterface } from '../../types/TabInterface';

interface Props {
  className?: string;
  activeKey?: string;
  tabs: TabInterface[];
}

export const EventTabs: React.FC<Props> = ({
  className = '',
  activeKey = '',
  tabs = []
}) => {
  return (
    <Card className={className}>
      <Tab.Container id='left-tabs-example' defaultActiveKey={activeKey}>
        <Card.Header className='border-0 pt-5'>
          <Row className='card-toolbar'>
            <Nav variant='pills' className='flex-row'>
              {tabs.map((tab: TabInterface) => (
                <Col key={tab.key} sm={3}>
                  <Nav.Item>
                    <Nav.Link eventKey={tab.key}>{tab.key}</Nav.Link>
                  </Nav.Item>
                </Col>
              ))}
            </Nav>
          </Row>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col>
              <Tab.Content>
                {tabs.map((tab: TabInterface) => (
                  <Tab.Pane key={tab.key} eventKey={tab.key}>
                    {tab.content}
                  </Tab.Pane>
                ))}
              </Tab.Content>
            </Col>
          </Row>
        </Card.Body>
      </Tab.Container>
    </Card>
  );
};
