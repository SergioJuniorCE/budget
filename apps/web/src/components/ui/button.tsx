import type { VariantProps } from "class-variance-authority";

import { Button as ButtonPrimitive } from "@base-ui/react/button";

import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonPrimitive.Props, VariantProps<typeof buttonVariants> {}

function Button({ className, variant = "default", size = "default", ...props }: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button };
