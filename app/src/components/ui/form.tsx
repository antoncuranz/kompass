import { useRender } from "@base-ui-components/react/use-render"
import * as React from "react"
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
} from "react-hook-form"
import type {
  ControllerProps,
  FieldPath,
  FieldValues,
  UseFormReturn,
} from "react-hook-form"

import type { FormEventHandler } from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// const OldForm = FormProvider

const Form = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = never,
  TTransformedValues = TFieldValues,
>({
  onSubmit,
  form,
  id,
  className,
  children,
}: {
  form: UseFormReturn<TFieldValues, TContext, TTransformedValues>
  onSubmit: FormEventHandler<HTMLFormElement>
  children: React.ReactNode | Array<React.ReactNode>
  id?: string | undefined
  className?: string | undefined
}) => {
  return (
    <FormProvider {...form}>
      <form
        id={id}
        onSubmit={onSubmit}
        className={cn("py-4 overflow-y-auto space-y-4 [&>div]:px-4", className)}
      >
        {children}
      </form>
    </FormProvider>
  )
}

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  ...props
}: ControllerProps<TFieldValues, TName, TTransformedValues> & {
  label: string
}) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller
        {...props}
        render={x => (
          <FormItem>
            <FormLabel>{props.label}</FormLabel>
            <FormControl>{props.render(x) as useRender.RenderProp}</FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState } = useFormContext()
  const formState = useFormState({ name: fieldContext.name })
  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
)

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("space-y-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  )
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  const { error, formItemId } = useFormField()

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
}

function FormControl({
  children = <div />,
}: {
  children?: useRender.RenderProp
}) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return useRender({
    render: children,
    props: {
      "data-slot": "form-control",
      id: formItemId,
      "aria-describedby": !error
        ? `${formDescriptionId}`
        : `${formDescriptionId} ${formMessageId}`,
      "aria-invalid": !!error,
    },
  })
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField()

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? "") : props.children

  if (!body) {
    return null
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-destructive text-sm", className)}
      {...props}
    >
      {body}
    </p>
  )
}

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
}
