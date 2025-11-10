import { useRouter } from "next/router";
import React from "react";
import styles from "./Nav.module.scss";

type Props = {
  route?: string;
  children: React.ReactNode;
  end?: boolean;
  // dropdown should be explicitly provided (true/false) to avoid relying
  // on undefined which may differ between server and client renders.
  dropdown?: boolean;
  // onClick must be a function when provided. Avoid boolean to keep server/client
  // props stable.
  onClick?: (() => void) | undefined;
  style?: React.CSSProperties;
};

const NavItem = ({ children, route, end, dropdown, onClick, style }: Props) => {
  const router = useRouter();

  const navigate: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (typeof route === "string") {
      router.push(route);
    }
    // call provided handler if any
    if (typeof onClick === 'function') {
      try { onClick(); } catch (e) { /* swallow */ }
    }
    event.stopPropagation();
  };

  return (
    <div
      style={style}
      className={
        [
          styles.navitem,
          (Boolean(route) || typeof onClick === 'function') ? styles.clickable : null,
          end ? styles.end : null,
          dropdown ? styles.dropdown : null,
        ]
          .filter(Boolean)
          .join(' ')
      }
      onClick={navigate}
    >
      {children}
    </div>
  );
};

export default NavItem;