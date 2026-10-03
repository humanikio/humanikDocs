import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { EndpointHeader } from '@/components/endpoint-header';
import { ApiSetup } from '@/components/api-setup';
import { AllocationChain, AnswerModes, CallPath, VoicePipeline } from '@/components/diagrams';
import {
  BoardNodes,
  DeviceRegistries,
  DeviceTransport,
  ToolBridge,
  ToolCallFlow,
  ToolSplit,
  TransportDirections,
} from '@/components/device-diagrams';
import { EmployeeShapes, EmployeeStates, WhoIsWho } from '@/components/huma-figures';
import type { MDXComponents } from 'mdx/types';

// Components available in every MDX file without an import. Anything used in
// `content/` must be registered here or the build fails at prerender.
export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Step,
    Steps,
    Tab,
    Tabs,
    Accordion,
    Accordions,
    EndpointHeader,
    ApiSetup,
    AllocationChain,
    AnswerModes,
    CallPath,
    VoicePipeline,
    BoardNodes,
    DeviceRegistries,
    DeviceTransport,
    ToolBridge,
    ToolCallFlow,
    ToolSplit,
    TransportDirections,
    WhoIsWho,
    EmployeeShapes,
    EmployeeStates,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
