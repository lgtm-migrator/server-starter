import express from "express";
import got, { Got } from "got";
import { Server } from "http";
import "reflect-metadata";
import { container } from "../src/.internal";
import { InjectType } from "../src/constants";
import "../src/providers";

const serverInstances = new Map<Got, Server>();

type ServerClient = Got & {
  shutdown: () => Promise<void>
}

export async function shutdownServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err !== undefined) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export async function setupClient(): Promise<ServerClient> {
  return new Promise(async (resolve, reject) => {
    try {
      const app = await container.getInstance(InjectType.Server) as express.Express;
      const server = app.listen(() => {
        const port = server.address()['port'];
        const client: any = got.extend({
          prefixUrl: `http://127.0.0.1:${port}/`,
        });
        client.shutdown = () => shutdownServer(server);
        serverInstances.set(client, server);
        resolve(client);
      });
    } catch (error) {
      reject(error);
    }
  });
};





