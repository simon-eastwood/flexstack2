import { Model, Node } from 'flexlayout-react';

export interface IAnalyzedModel {
    model: Model,
    preferredWidth: number
}

export interface IDimensions {
    minWidth: number | undefined,
    preferredWidth: number | undefined,
    width: number | undefined
}