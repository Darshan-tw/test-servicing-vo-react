import React, { ReactElement } from 'react'
import { render as rtlRender, RenderOptions } from '@testing-library/react'

export const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
    </>
  )
}

export const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => rtlRender(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }