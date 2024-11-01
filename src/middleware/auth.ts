// for method post, edit, delete we must check for token
// for method get we must check for token and if not found, return 401

import { z } from "zod";
import { Context } from "../types";
import { Hono } from "hono";

const auth = new Hono<Context>();
