import React from "react";

type FontScaleProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

function FontScale({ children, ...rest }: FontScaleProps) {
  return (
    <div data-font-scale-applied {...rest}>
      {children}
    </div>
  );
}

export default FontScale;