import { Model, Node } from 'flexlayout-react';

export interface IAnalyzedModel {
    model: Model,
    widthPreferred: number
}

export interface IDimensions {
    widthNeeded: number | undefined,
    widthPreferred: number | undefined,
    width: number | undefined
}