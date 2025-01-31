import { Direction } from "@constants/enum.constants";
import { ToolsNames } from "@constants/tools.constants";

import { ToolbarItemButton } from "../ToolbarItem";
import type { IToolbarItemsProps } from "../ToolbarItems";

const toolbarItemsList: ToolbarItemButton[] = [];

const props: IToolbarItemsProps = {
    toolbarItemsList,
    direction: Direction.Bottom,
};

export default props;
