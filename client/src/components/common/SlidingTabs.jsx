import React, { Children, cloneElement, useState } from "react";
import s from "./SlidingTabs.module.css";

export default function SlidingTabs({
  className: propsClass,
  tab: selectedTabName,
  children,
  ...props
}) {
  const [prevTabName, setPrevTabName] = useState(selectedTabName);

  const tabs = new Map(
    Children.toArray(children).map((child) => [child.props.tab, child]),
  );

  const hasTabChanged = selectedTabName !== prevTabName;

  const keys = Array.from(tabs.keys());
  const isForward = keys.indexOf(prevTabName) < keys.indexOf(selectedTabName);
  const direction = isForward ? s.forwards : s.backwards;
  const className = [propsClass, s.container].filter(Boolean).join(" ");
  const prevTabClass = [s.tab, s.prev, direction].join(" ");
  const nextTabClass = [s.tab, s.next, direction].join(" ");

  return (
    <div {...{ ...props, className }}>
      {hasTabChanged ? (
        <>
          {mergeProps(tabs.get(prevTabName), {
            className: prevTabClass,
            key: prevTabName,
            onAnimationEnd: handleAnimationEnd,
          })}
          {mergeProps(tabs.get(selectedTabName), {
            className: nextTabClass,
            key: selectedTabName,
          })}
        </>
      ) : (
        mergeProps(tabs.get(selectedTabName), {
          className: s.tab,
          key: selectedTabName,
        })
      )}
    </div>
  );

  function handleAnimationEnd(e) {
    if (e.target === e.currentTarget) {
      setPrevTabName(selectedTabName);
    }
  }
}

function mergeProps(element, { className, key, onAnimationEnd }) {
  const { props: existingProps } = element;
  const { className: _className, onAnimationEnd: _onAnimationEnd } =
    existingProps;

  return cloneElement(element, {
    ...existingProps,
    className: [_className, className].filter(Boolean).join(" "),
    key,
    onAnimationEnd: (e) => {
      if (_onAnimationEnd) _onAnimationEnd(e);
      if (onAnimationEnd) onAnimationEnd(e);
    },
  });
}
