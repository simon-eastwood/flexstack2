import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import 'flexlayout-react/style/light.css'

import { Layout, Model, TabNode, Action, DockLocation } from 'flexlayout-react';

import { analyseModel } from './FlexModelUtils';


import { loadTemplateModel } from './LoadTemplate'
import { IAnalyzedModel } from './types';


function App() {
  // currentModel is what we're currently rendering.
  // If we need to alter the layout due to size restrictions, the previous state is saved in "stashedModels" so that it can be restored later
  const [currentModel, setCurrentModel] = useState<IAnalyzedModel>(() => {
    return loadTemplateModel()
  });
  const [maxPanels, setMaxPanels] = useState(5);

  const factory = (node: TabNode) => {
    var component = node.getComponent();
    if (component === "text") {
      return <div dangerouslySetInnerHTML={{ __html: node.getConfig().uri }} />
    } else if (component === "pdf") {
      const iStyles = {
        height: '99%',
        width: '99%',
        overflow: 'hidden',
        border: 'none'
      }
      const cont = {
        height: '100%',
        width: '100%',
        overflow: 'hidden'
      }
      return <div style={cont}>  <iframe src={node.getConfig().uri} className="invisible-scrollbar" style={iStyles} scrolling="no" /> </div>
    } else if (component === "image") {
      const s = {
        height: '99%',
        width: '99%'
      }
      return <img src={node.getConfig().uri} style={s} />
    } else if (component === "123check") {
      const s = {
        width: '1200px',
        height: '1000px'
      }
      return <img src={node.getConfig().uri} style={s} />
    }
  }

  const interceptAction = (action: Action) => {

    // when tabs are moved by the user, this can lead to a "divide" whereby a new tabset is created automatically for the tab
    // this new tabset will not have a minimum size and so this needs to be set
    // also for deletion of tabs or addition of nodes, the size may be impacted
    setTimeout(() => {
      setCurrentModel(analyseModel(currentModel.model, true /* update min sizes if needed*/));
    }, 100);

    return action;
  }

  const loadPanels = (event: any) => {
    setMaxPanels(parseInt(event.target.value));
    setCurrentModel(loadTemplateModel(parseInt(event.target.value)));
  }

  const modelChanged = (model: Model) => {
    setCurrentModel(analyseModel(currentModel.model, false /* avoid infintie loop*/))
  }




  return (
    <div className="outer">
      <span> Number of Panels:</span>
      <select value={maxPanels} onChange={loadPanels}>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
      </select>
      <div className="inner" >
        {currentModel && (
          <Layout
            onAction={interceptAction}
            onModelChange={modelChanged}
            model={currentModel.model}
            factory={factory} />)}
      </div>
    </div>

  );
}

export default App;
