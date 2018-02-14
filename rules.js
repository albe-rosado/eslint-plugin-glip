'use strict';

module.exports = {
	'no-camelcase': (context) => ({
		VariableDeclarator: (node) => {
			if (node.id.name) {
				const first_character = node.id.name.charAt(0);
				const chars = node.id.name.split('');
				if (first_character === first_character.toLowerCase()) {
					for (let i = 1, n = chars.length; i < n; i++) {
						const char = chars[i];
						if (char === '_' || Number.isFinite(parseInt(char, 10))) {
							continue;
						}
						if (char === char.toUpperCase()) {
							context.report(node, 'Variables may not contain camelCase');
						}
					}
				}
			}
		}
	}),
	'no-func-param-named-arguments': (context) => {
		const check_parameters = (node) => {
			if (node && node.params && node.params.length) {
				node.params.forEach((param_node) => {
					if (param_node && param_node.name && param_node.name === 'arguments') {
						context.report(
							param_node,
							'Function parameter named \'arguements\' is not allowed'
						);
					}
				});
			}
		};
		const rule = {
			FunctionDeclaration: check_parameters,
			FunctionExpression: check_parameters,
			ArrowFunctionExpression: check_parameters,
		};
		return rule;
	},
	/**
     * based on es5/no-es6-methods
     * Will only allow unsupported es6 methods if they're invoked by:
     * _ (underscore),
     * L (lodash),
     * $ (JQuery)
     */
	'no-es6-methods': (context) => {
		const rule = {
			CallExpression: (node) => {
				const callee_node = node.callee;
				const callee_node_object = callee_node.object;

				if (!callee_node_object) {
					return;
				}

				const acceptable_invokers = [
					'_',
					'L',
					'$'
				];
				const es6_array_functions = [
					'find',
					'findIndex',
					'copyWithin',
					'values',
					'fill'
				];
				const es6_string_functions = [
					'startsWith',
					'endsWith',
					'includes',
					'repeat'
				];
				const es6_functions = [].concat(
					es6_array_functions,
					es6_string_functions
				);
				let function_name;
				let invoking_object;

				if (callee_node && callee_node.property && callee_node.property.name) {
					function_name = callee_node.property.name;

					if (es6_functions.indexOf(function_name) === -1) {
						return;
					}
				}

				if (callee_node_object.type === 'Identifier') {
					invoking_object = callee_node_object.name;
					invoking_object = invoking_object.match(/^\$/) ? '$' : invoking_object;
				}
				else if (callee_node_object.type === 'MemberExpression') {
					invoking_object = callee_node_object.property.name;
					invoking_object = invoking_object.match(/^\$/) ? '$' : invoking_object;
				}

				if (acceptable_invokers.indexOf(invoking_object) === -1) {
					context.report({
						node: node.callee.property,
						message: `ES6 methods not allowed: ${function_name}`
					});
				}
			}
		};
		return rule;
	}
};
