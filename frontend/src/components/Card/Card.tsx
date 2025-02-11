import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Base Card component
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        // Default shadcn/ui card styles:
        className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

/**
 * Card Header: typically holds a title and possibly an actions area.
 */
export const CardHeader = ({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      // Default styles for a card header:
      className={`border-b p-4 ${className}`}
      {...props}
    />
  );
};

/**
 * Card Title: the main heading inside a card header.
 */
export const CardTitle = ({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h3
      // Default styles for a card title:
      className={`text-lg font-semibold leading-none tracking-tight ${className}`}
      {...props}
    />
  );
};

/**
 * Card Content: the main body area of the card.
 */
export const CardContent = ({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      // Default styles for card content:
      className={`p-4 ${className}`}
      {...props}
    />
  );
};
