import { Model, IJsonModel, TabSetNode, TabNode, Actions, Node as FLNode, Action } from 'flexlayout-react';

import { analyseModel, removeTabset } from './FlexModelUtils';
import { IAnalyzedModel, IDimensions } from './types';

const bundleExample = {
    "id": "igra",
    "bundle": [
        {
            "type": "pdf",
            "uri": "https://www.ibm.com/downloads/cas/GB8ZMQZ3#view=FitH",
            "title": "Communication",
            "doPrecheck": false,
            "panelPreferences": [1.1, 1.1, 1.1, 1.1, 1.1]
        },
        {
            "type": "pdf",
            "uri": "https://ai.stanford.edu/~nilsson/MLBOOK.pdf#view=FitH",
            "title": "Letter",
            "doPrechack": false,
            "panelPreferences": [-1.3, -1.3, 2.1, 2.1, 2.1]
        },
        {
            "type": "pdf",
            "uri": "https://patentimages.storage.googleapis.com/68/80/73/6a17a66e9ec8c5/US11107588.pdf#view=FitH",
            "title": "Claims",
            "doPrechack": false,
            "panelPreferences": [-1.4, -2.2, -3.2, 3.1, 3.1]
        },
        {
            "type": "image",
            "uri": "https://patentimages.storage.googleapis.com/US20060145019A1/US20060145019A1-20060706-D00000.png",
            "title": "figure",
            "doPrechack": false,
            "panelPreferences": [-1.2, -1.2, -1.2, -1.2, 4.1]
        },
        {
            "type": "123check",
            "uri": "/flexstack2/123Check_only.png",
            "title": "AppAn",
            "doPrechack": false,
            "panelPreferences": [-1.5, 2.1, 3.1, 4.1, 5.1]
        }


    ]
};

const w2wTemplateLayout: { name: string, model: IJsonModel } = {
    name: 'w2w-template',
    model: {
        global: {
            "rootOrientationVertical": false,
            // "tabSetEnableDivide": false, // it keeps things simpler for moving tabs if all tabsets are labelled with a panel nr
            // "enableEdgeDock": false, // otherwise the user can create new rows by dragging into the edge
            //"tabEnableClose": false
        }, // {tabSetEnableTabStrip:false}, // to have just splitters
        layout: {
            "type": "row",
            "children": [
                {
                    "type": "tabset",
                    "selected": 0,
                    "children": [
                        {
                            "name": "",
                            "type": "tab",
                            "component": "",
                            "enableClose": false,
                            "config": {

                            }
                        }
                    ]
                },
                {
                    "type": "tabset",
                    "selected": 0,
                    "children": [
                        {
                            "type": "tab",
                            "name": "",
                            "component": "",
                            "enableClose": false,
                            "config": {

                            }
                        }
                    ]
                },
                {
                    "type": "tabset",
                    "selected": 0,
                    "children": [
                        {
                            "type": "tab",
                            "name": "",
                            "component": "",
                            "enableClose": false,
                            "config": {

                            }
                        }
                    ]
                },

                {
                    "type": "tabset",
                    "selected": 0,
                    "children": [
                        {
                            "type": "tab",
                            "name": "",
                            "component": "",
                            "enableClose": false,
                            "config": {
                            }
                        }
                    ]
                },
                {
                    "type": "tabset",
                    "selected": 0,
                    "children": [
                        {
                            "type": "tab",
                            "name": "",
                            "component": "",
                            "enableClose": true,
                            "config": {

                            }
                        }
                    ]
                }
            ]
        }
    }
};


const getMfeConfig = (mfe: string): IDimensions => {
    // hard coded for now....

    switch (mfe) {
        case 'pdf':
            return {
                minWidth: 50,
                preferredWidth: undefined,
                width: undefined
            }
            break;
        case '123check':
            return {
                minWidth: 774,
                preferredWidth: 1280,
                width: 1280
            }

            break;
        case 'image':
            return {
                minWidth: 250,
                preferredWidth: undefined,
                width: undefined
            }

            break;
        default:
            return {
                minWidth: undefined,
                preferredWidth: undefined,
                width: undefined
            }
            break;
    }
}


const isEmpty = (tab: TabNode): boolean => {
    const c = tab.getComponent();
    const check = !c || c.length === 0;
    return check;
}


const getTemplate = (): Model => {
    const panels = new Array<TabNode>();

    const template = Model.fromJson(w2wTemplateLayout.model);

    template.visitNodes((node) => {
        if (node.getType() === TabNode.TYPE) {
            const tab = node as TabNode;
            if (isEmpty(tab)) {
                panels.push(tab);
            }
        }
    });

    bundleExample.bundle.forEach((bundleItem) => {
        const destPref = bundleItem.panelPreferences[panels.length - 1];
        const destMajor = Math.floor(Math.abs(destPref));
        const destMinor = Math.round((Math.abs(destPref) === destMajor) ? 0 : (Math.abs(destPref) - destMajor) * 10);
        const mfeConfig = getMfeConfig(bundleItem.type);

        let destinationPanel = panels[0]; // default
        if (destMajor <= panels.length) {
            destinationPanel = panels[destMajor - 1];
        }

        const newConfig = { ...destinationPanel.getConfig(), ...mfeConfig, ...bundleItem };

        const attrs = {
            name: bundleItem.title,
            component: bundleItem.type,
            config: newConfig
        };
        const set = Actions.updateNodeAttributes(destinationPanel.getId(), attrs);
        template.doAction(set);
    });

    panels.forEach(panel => console.log(panel));

    return template;
}


const rmEmptyTabs = (model: Model) => {
    const rms = new Array<Action>();
    console.log("deleting");
    model.visitNodes(node => {
        if (node.getType() === TabNode.TYPE && isEmpty(node as TabNode)) {
            rms.push(Actions.deleteTab(node.getId()))
        }
    });
    rms.forEach(action => model.doAction(action));
}

// if maxPanel is undefined, return the canonical model (or in future the user's saved model if there is one, and the canonical model failing that)
// if maxPanel is defined, transform the model 
export const loadTemplateModel = (maxPanel?: number) => {
    let initialModel = getTemplate();
    let adaptedModel = initialModel;
    let fullModel: IAnalyzedModel;


    // if the caller has specified the nr of panels, then return a model that meets that requirement
    if (maxPanel) {
        adaptedModel = removeTabset(initialModel, maxPanel + 1);

        fullModel = analyseModel(adaptedModel, true, true);

    } else { // I have to figure out myself how many panels fit the current viewport
        const availableWidth = window.innerWidth;


        fullModel = analyseModel(initialModel, true, true);
        // see how many panels there are in the full model
        let nrPanels = 0;
        fullModel.model.visitNodes((node) => { if (node.getType() === TabSetNode.TYPE) nrPanels++ });

        // remove tabset one by one until it fits
        while (nrPanels > 1 && availableWidth < fullModel.preferredWidth) {
            adaptedModel = removeTabset(fullModel.model, nrPanels);
            fullModel = analyseModel(adaptedModel, true, true);
            nrPanels--;
        }

    }

    // Now that all the processing has finished,
    // delete any empty tabsets in case some panels were not used by the bundle
    rmEmptyTabs(fullModel.model);


    // removing empty tabs will not impact the dimensions, so no need to recalculate
    return fullModel;

}