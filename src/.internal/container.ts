import { InjectContainer } from "@newdash/inject";

export const container = InjectContainer.New();

export const register = container.registerProvider.bind(container)