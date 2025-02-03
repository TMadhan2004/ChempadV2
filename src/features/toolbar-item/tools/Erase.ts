/* eslint-disable @typescript-eslint/no-unused-vars */
import * as ToolsConstants from "@constants/tools.constants";
import { Atom, Bond } from "@entities";
import { EditorHandler } from "@features/editor/EditorHandler";
import { MouseEventCallBackProperties } from "@src/types";
import { LayersUtils } from "@src/utils/LayersUtils";
import { LayersNames } from "@constants/enum.constants";
import { Box, Element } from "@svgdotjs/svg.js";

import { LaunchAttrs, SimpleToolbarItemButtonBuilder } from "../ToolbarItem";
import { RegisterToolbarButtonWithName } from "../ToolsButtonMapper.helper";
import { BoxSelect } from "./SelectTemplate";
import { RegisterToolbarWithName } from "./ToolsMapper.helper";

class EraseBox extends BoxSelect {
    selectColor: string = "#ff9a9a";
    shapeFillColor: string = "#df5c83";
    isMouseDown: boolean = false;

    onActivate(attrs?: LaunchAttrs) {
        if (!attrs) return;
        const { editor } = attrs;
        if (!editor) {
            throw new Error("EraseBox.onActivate: missing attributes or editor");
        }
        editor.setHoverMode(true, true, true, this.selectColor);
    }

    findShapeAtPoint(x: number, y: number): Element | null {
        const generalLayer = LayersUtils.getLayer(LayersNames.General);
        const shapes = generalLayer.children();
        
        for (const shape of shapes) {
            const bbox = shape.bbox();
            if (bbox && this.pointInBBox(x, y, bbox)) {
                return shape;
            }
        }
        return null;
    }

    onMouseDown(eventHolder: MouseEventCallBackProperties): void {
        this.isMouseDown = true;
        const { editor, mouseDownLocation } = eventHolder;
        
        // Check if there's a hovered entity to erase
        if (editor.hovered) {
            if (editor.hovered instanceof Atom || editor.hovered instanceof Bond) {
                editor.hovered.destroy();
                editor.createHistoryUpdate();
                editor.setHoverMode(true, true, true, this.selectColor);
                return;
            }
        }

        // Check for shapes at the clicked point
        const clickedShape = this.findShapeAtPoint(mouseDownLocation.x, mouseDownLocation.y);
        if (clickedShape) {
            clickedShape.remove();
            editor.createHistoryUpdate();
            return;
        }

        // If no entity or shape is clicked, start box selection
        super.onMouseDown(eventHolder);
        this.createShape(eventHolder);
    }

    onMouseUp(eventHolder: MouseEventCallBackProperties): void {
        if (!this.isMouseDown) return;
        
        this.isMouseDown = false;
        
        // If we have a selection box
        if (this.isThereShape()) {
            // First perform the erase action
            this.doAction(eventHolder.editor);
            // Then remove the selection box
            this.removeShape();
        }
        
        // Reset selection mode
        this.selectionMode = -1;
    }

    onMouseMove(eventHolder: MouseEventCallBackProperties): void {
        if (!this.isMouseDown || !this.isThereShape()) return;
        
        this.updateShape(eventHolder);
        const { editor } = eventHolder;
        
        // Get the current selection box bounds
        const rectBBox = this.rect?.bbox();
        if (!rectBBox) return;

        // Reset selections
        editor.resetSelectedAtoms();
        editor.resetSelectedBonds();
        
        // Select atoms within the box
        editor.applyFunctionToAtoms((atom: Atom) => {
            const pos = (atom as any).center;
            if (pos && this.pointInBBox(pos.x, pos.y, rectBBox)) {
                editor.selectedAtoms.set(atom.getId(), atom);
            }
        }, false);
        
        // Select bonds within the box
        editor.applyFunctionToBonds((bond: Bond) => {
            const startAtom = (bond as any).startAtom;
            const endAtom = (bond as any).endAtom;
            if (startAtom && endAtom) {
                const startPos = startAtom.center;
                const endPos = endAtom.center;
                if ((startPos && this.pointInBBox(startPos.x, startPos.y, rectBBox)) ||
                    (endPos && this.pointInBBox(endPos.x, endPos.y, rectBBox))) {
                    editor.selectedBonds.set(bond.getId(), bond);
                }
            }
        }, false);
    }

    pointInBBox(x: number, y: number, bbox: Box): boolean {
        return x >= bbox.x && x <= bbox.x + bbox.width && 
               y >= bbox.y && y <= bbox.y + bbox.height;
    }

    boxesIntersect(box1: Box, box2: Box): boolean {
        return box1.x < box2.x + box2.width &&
               box1.x + box1.width > box2.x &&
               box1.y < box2.y + box2.height &&
               box1.y + box1.height > box2.y;
    }

    doAction(editor: EditorHandler): void {
        let changed = 0;
        
        // Get the current selection box bounds
        const rectBBox = this.rect?.bbox();
        if (rectBBox) {
            // Delete shapes that intersect with the selection box
            const generalLayer = LayersUtils.getLayer(LayersNames.General);
            const shapes = generalLayer.children();
            
            for (const shape of shapes) {
                const shapeBBox = shape.bbox();
                if (shapeBBox && this.boxesIntersect(rectBBox, shapeBBox)) {
                    shape.remove();
                    changed++;
                }
            }
        }
        
        // Delete selected atoms
        editor.selectedAtoms.forEach((atom: Atom) => {
            atom.destroy();
            changed++;
        });
        
        // Delete selected bonds
        editor.selectedBonds.forEach((bond: Bond) => {
            bond.destroy();
            changed++;
        });
        
        // Clear selections
        editor.resetSelectedAtoms();
        editor.resetSelectedBonds();
        
        if (changed > 0) {
            editor.createHistoryUpdate();
        }
        editor.setHoverMode(true, true, true, this.selectColor);
    }
}

const eraseBoxTool = new EraseBox();
RegisterToolbarWithName(ToolsConstants.ToolsNames.Erase, eraseBoxTool);

const eraseBox = new SimpleToolbarItemButtonBuilder(
    "Erase Box",
    ToolsConstants.ToolsNames.Erase,
    ToolsConstants.ToolsShortcutsMapByToolName.get(ToolsConstants.ToolsNames.Erase)
);

RegisterToolbarButtonWithName(eraseBox);

export default eraseBox;
