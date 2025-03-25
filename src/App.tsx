/* eslint-disable react/style-prop-object */
import "@styles/App.scss";
import "@features/chatbot/chatbot.css";
import "@styles/animations.scss";

import Editor from "@features/editor/Editor";
import { EditorHandler } from "@features/editor/EditorHandler";
import {
    DialogShow,
    LeftToolbarProps,
    RightToolbarProps,
    ToolbarItems,
    TopToolbarProps,
} from "@features/toolbar-item";
import Chatbot from "@features/chatbot/Chatbot";
import styles from "@styles/index.module.scss";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import chempadLogo from "@styles/icons/chempadv2.jpeg";

const editorHandler = new EditorHandler();

function App() {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        // Add smooth page load animation
        setLoaded(true);
        
        // Ensure toolbar icons are properly sized
        const resizeIcons = () => {
            const icons = document.querySelectorAll('.toolbar button svg, .toolbar button img');
            icons.forEach(icon => {
                if (icon instanceof HTMLElement) {
                    icon.style.width = '24px';
                    icon.style.height = '24px';
                }
            });
        };
        
        // Run once on load and then on window resize
        resizeIcons();
        window.addEventListener('resize', resizeIcons);
        
        return () => {
            window.removeEventListener('resize', resizeIcons);
        };
    }, []);

    return (
        <div className={clsx("App", styles.app, loaded && "fade-in")}>
            <img 
                src={chempadLogo} 
                alt="ChemPad Logo" 
                className={clsx("chempad-logo", loaded && "slide-in-left")}
                title="ChemPad - Professional Chemistry Drawing Tool"
            />

            <div className={clsx(styles.top, "top-toolbar", loaded && "slide-down delay-1")}>
                <ToolbarItems {...TopToolbarProps} />
            </div>

            <div className={clsx(styles.right, "right-toolbar", loaded && "slide-in-right delay-2")}>
                <ToolbarItems {...RightToolbarProps} />
            </div>

            <div className={clsx(styles.left, "left-toolbar", loaded && "slide-in-left delay-2")}>
                <ToolbarItems {...LeftToolbarProps} />
            </div>

            <div className={clsx(styles.draw, "drawing-area", loaded && "scale-up delay-3")}>
                <Editor editorHandler={editorHandler} />
                {/* SVG sketchpad is placed here */}
            </div>

            <DialogShow editorHandler={editorHandler} />
            <Chatbot />
        </div>
    );
}

export default App;
