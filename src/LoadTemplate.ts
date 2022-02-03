import { Model, IJsonModel, TabSetNode, TabNode, Actions } from 'flexlayout-react';

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
                            "name": "Test",
                            "type": "tab",
                            "component": "pdf",
                            "enableClose": false,
                            "config": {
                                "uri": "https://ai.stanford.edu/~nilsson/MLBOOK.pdf#view=FitH",
                                "minWidth": 50,
                                "preferredWidth": 150,
                                "panelPreferences": [-1.3, -1.3, 2.1, 2.1, 2.1]
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
                            "name": "Letter",
                            "component": "pdf",
                            "enableClose": false,
                            "config": {
                                "uri": "https://ai.stanford.edu/~nilsson/MLBOOK.pdf#view=FitH",
                                "minWidth": 50,
                                "preferredWidth": 150,
                                "panelPreferences": [-1.3, -1.3, 2.1, 2.1, 2.1]
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
                            "name": "Claims",
                            "component": "pdf",
                            "enableClose": false,
                            "config": {
                                "uri": "https://patentimages.storage.googleapis.com/68/80/73/6a17a66e9ec8c5/US11107588.pdf#view=FitH",
                                "minWidth": 50,
                                "preferredWidth": 150,
                                "panelPreferences": [-1.4, -2.2, -3.2, 3.1, 3.1]
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
                            "name": "Fig",
                            "component": "image",
                            "enableClose": false,
                            "config": {
                                "uri": "https://patentimages.storage.googleapis.com/US20060145019A1/US20060145019A1-20060706-D00000.png",
                                "minWidth": 250,
                                "preferredWidth": 250,
                                "panelPreferences": [-1.2, -1.2, -1.2, -1.2, 4.1]
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
                            "name": "AppAn",
                            "component": "123check",
                            "enableClose": true,
                            "config": {
                                "uri": "/flexstack2/123Check_only.png",
                                "width": 1280,
                                "minWidth": 774,
                                "preferredWidth": 1280,
                                "panelPreferences": [-1.5, 2.1, 3.1, 4.1, 5.1]
                            }
                        }
                    ]
                }
            ]
        }
    }
};


const getDimensions = (mfe: string): IDimensions => {
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


const getTemplate = (): Model => {
    const panels = new Array<TabNode>();

    const template = Model.fromJson(w2wTemplateLayout.model);

    template.visitNodes((node) => {
        if (node.getType() === TabNode.TYPE) {
            const tab = node as TabNode; panels.push(tab);
            /*            if (!tab.getComponent()  || tab.getComponent()?.length === 0 ) {
                            panels.push(tab);
                        } */
        }
    });

    bundleExample.bundle.forEach((bundleItem) => {
        const destPref = bundleItem.panelPreferences[panels.length - 1];
        const destMajor = Math.floor(Math.abs(destPref));
        const destMinor = Math.round((Math.abs(destPref) === destMajor) ? 0 : (Math.abs(destPref) - destMajor) * 10);
        const mfeConfig = getDimensions(bundleItem.type);

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

    return fullModel;

}