'use client'
import React, { Fragment, useEffect, useState } from "react";
import { FiChevronRight } from "react-icons/fi";
import { menuList } from "@/utils/fackData/menuList";
import getIcon from "@/utils/getIcon";
import { usePathname } from "next/navigation";
import Link from "next/link";

const Menus = () => {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [openSubDropdown, setOpenSubDropdown] = useState(null);
    const [activeParent, setActiveParent] = useState("");
    const [activeChild, setActiveChild] = useState("");
    const pathName = usePathname();

    const handleMainMenu = (e, name) => {
        if (openDropdown === name) {
            setOpenDropdown(null);
        } else {
            setOpenDropdown(name);
        }
    };

    const handleDropdownMenu = (e, name) => {
        e.stopPropagation();
        if (openSubDropdown === name) {
            setOpenSubDropdown(null);
        } else {
            setOpenSubDropdown(name);
        }
    };

    useEffect(() => {
        if (pathName !== "/") {
            const x = pathName.split("/").filter(Boolean); // Remove empty strings
            // Check if path matches any menu item to determine parent
            let foundParent = null;
            let foundChild = null;
            
            menuList.forEach((menu) => {
                if (menu.dropdownMenu) {
                    menu.dropdownMenu.forEach((child) => {
                        if (child.path === pathName) {
                            foundParent = menu.name.split(' ')[0];
                            foundChild = child.name;
                        }
                    });
                }
            });
            
            // If found in menu, use that, otherwise use path segments
            if (foundParent) {
                setActiveParent(foundParent);
                setActiveChild(foundChild);
                setOpenDropdown(foundParent);
                if (foundChild) {
                    setOpenSubDropdown(foundChild);
                }
            } else {
                // Fallback to path-based logic
                setActiveParent(x[0] || "");
                setActiveChild(x[1] || "");
                setOpenDropdown(x[0] || "");
                setOpenSubDropdown(x[1] || "");
            }
        } else {
            setActiveParent("dashboards");
            setOpenDropdown("dashboards");
        }
    }, [pathName]);

    return (
        <>
            {menuList.map(({ dropdownMenu, id, name, path, icon }) => {
                return (
                    <li
                        key={id}
                        onClick={(e) => handleMainMenu(e, name.split(' ')[0])}
                        className={`nxl-item nxl-hasmenu ${activeParent === name.split(' ')[0] ? "active nxl-trigger" : ""}`}
                    >
                        <Link href={path} className="nxl-link text-capitalize">
                            <span className="nxl-micon"> {getIcon(icon)} </span>
                            <span className="nxl-mtext" style={{ paddingLeft: "2.5px" }}>
                                {name}
                            </span>
                            <span className="nxl-arrow fs-16">
                                <FiChevronRight />
                            </span>
                        </Link>
                        <ul className={`nxl-submenu ${openDropdown === name.split(' ')[0] ? "nxl-menu-visible" : "nxl-menu-hidden"}`}>
                            {dropdownMenu.map(({ id, name, path, subdropdownMenu, target }) => {
                                const x = name;
                                return (
                                    <Fragment key={id}>
                                        {subdropdownMenu.length ? (
                                            <li
                                                className={`nxl-item nxl-hasmenu ${activeChild === name ? "active" : ""}`}
                                                onClick={(e) => handleDropdownMenu(e, x)}
                                            >
                                                <Link href={path} className={`nxl-link text-capitalize`}>
                                                    <span className="nxl-mtext">{name}</span>
                                                    <span className="nxl-arrow">
                                                        <i>
                                                            {" "}
                                                            <FiChevronRight />
                                                        </i>
                                                    </span>
                                                </Link>
                                                {subdropdownMenu.map(({ id, name, path }) => {
                                                    return (
                                                        <ul
                                                            key={id}
                                                            className={`nxl-submenu ${openSubDropdown === x
                                                                ? "nxl-menu-visible"
                                                                : "nxl-menu-hidden "
                                                                }`}
                                                        >
                                                            <li
                                                                className={`nxl-item ${pathName === path ? "active" : ""
                                                                    }`}
                                                            >
                                                                <Link
                                                                    className="nxl-link text-capitalize"
                                                                    href={path}
                                                                >
                                                                    {name}
                                                                </Link>
                                                            </li>
                                                        </ul>
                                                    );
                                                })}
                                            </li>
                                        ) : (
                                            <li className={`nxl-item ${pathName === path ? "active" : ""}`}>
                                                <Link className="nxl-link" href={path} target={target}>
                                                    {name}
                                                </Link>
                                            </li>
                                        )}
                                    </Fragment>
                                );
                            })}
                        </ul>
                    </li>
                );
            })}
        </>
    );
};

export default Menus;
