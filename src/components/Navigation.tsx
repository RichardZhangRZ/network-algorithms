import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import DistanceVectorSimulator from './DistanceVectorSimulator';

const Navigation = () => {

  return (
    <Tabs variant='unstyled'>
    <TabList>
      <Tab _selected={{ color: 'white', bg: 'blue.500' }}>Distance Vector</Tab>
      <Tab _selected={{ color: 'white', bg: 'green.400' }}>Tab 2</Tab>
    </TabList>
    <TabPanels>
      <TabPanel>
        <DistanceVectorSimulator></DistanceVectorSimulator>
      </TabPanel>
      <TabPanel>
        <p>two!</p>
      </TabPanel>
    </TabPanels>
  </Tabs>
  )
}

export default Navigation;