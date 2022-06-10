# node-red-s1seven-api

## Introduction

This is a custom node that wraps the S1Seven [API](https://developers.s1seven.com/docs/openapi/) in several custom nodes that can be used in Node-Red. There is a separate node available for each endpoint which can be found in the S1Seven category in the Palette on the left-hand side of the screen. 

The endpoints that are currently available are `hash`, `validate`, `notarize`, `get a company by id` and `get identities`. All of these nodes share a single `config` node, which allows you to easily set the `access token`, `company id`, `mode` and `app`.

## Usage

To notarize, hash or validate a certificate, simply pass in a valid JSON certificate as `msg.payload` or add it to `global.certificate`. Each node is thoroughly documented with a help text in the sidebar. To access it, select an S1Seven node, and click on the book icon on the top right of the screen (underneath the `Deploy` button). There you can see what input is required by each individual node.

Each node simply takes the required input via the config ui or the `msg` object, and outputs the `data` property of the response. 