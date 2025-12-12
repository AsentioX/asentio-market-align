
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				asentio: {
					blue: '#0A2342',
					lightgray: '#F5F5F7',
					red: '#CF0A0A'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				poppins: ['Poppins', 'sans-serif'],
				inter: ['Inter', 'sans-serif']
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0',
						opacity: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)',
						opacity: '1'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)',
						opacity: '1'
					},
					to: {
						height: '0',
						opacity: '0'
					}
				},
				'undulate-1': {
					'0%, 100%': {
						transform: 'translate(0px, 0px)'
					},
					'20%': {
						transform: 'translate(5px, -8px)'
					},
					'40%': {
						transform: 'translate(-6px, 3px)'
					},
					'60%': {
						transform: 'translate(4px, 6px)'
					},
					'80%': {
						transform: 'translate(-3px, -4px)'
					}
				},
				'undulate-2': {
					'0%, 100%': {
						transform: 'translate(0px, 0px)'
					},
					'15%': {
						transform: 'translate(-7px, 4px)'
					},
					'35%': {
						transform: 'translate(3px, -6px)'
					},
					'55%': {
						transform: 'translate(-4px, -3px)'
					},
					'75%': {
						transform: 'translate(6px, 5px)'
					}
				},
				'undulate-3': {
					'0%, 100%': {
						transform: 'translate(0px, 0px)'
					},
					'25%': {
						transform: 'translate(4px, 7px)'
					},
					'50%': {
						transform: 'translate(-5px, -4px)'
					},
					'75%': {
						transform: 'translate(6px, -5px)'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'float-slow': {
					'0%, 100%': {
						transform: 'translateY(0) translateX(0)'
					},
					'25%': {
						transform: 'translateY(-15px) translateX(5px)'
					},
					'50%': {
						transform: 'translateY(-5px) translateX(-5px)'
					},
					'75%': {
						transform: 'translateY(-20px) translateX(3px)'
					}
				},
				'drift': {
					'0%, 100%': {
						transform: 'translateX(0) translateY(0)'
					},
					'50%': {
						transform: 'translateX(20px) translateY(-10px)'
					}
				},
				'orbit': {
					'0%': {
						transform: 'rotate(0deg)'
					},
					'100%': {
						transform: 'rotate(360deg)'
					}
				},
				'pulse-glow': {
					'0%, 100%': {
						opacity: '0.3'
					},
					'50%': {
						opacity: '1'
					}
				},
				'scan-line': {
					'0%': {
						top: '0%'
					},
					'50%': {
						top: '100%'
					},
					'100%': {
						top: '0%'
					}
				},
				'rotate-slow': {
					'0%': {
						transform: 'rotate(0deg)'
					},
					'100%': {
						transform: 'rotate(360deg)'
					}
				},
				'data-stream': {
					'0%': {
						transform: 'translateY(-100%)'
					},
					'100%': {
						transform: 'translateY(500%)'
					}
				},
				'orbit-3d': {
					'0%': {
						transform: 'rotateX(70deg) rotateZ(0deg)'
					},
					'100%': {
						transform: 'rotateX(70deg) rotateZ(360deg)'
					}
				}
			},
			'marquee': {
				'0%': {
					transform: 'translateX(0)'
				},
				'100%': {
					transform: 'translateX(-50%)'
				}
			}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s ease-out forwards',
				'float-slow': 'float-slow 30s ease-in-out infinite',
				'drift': 'drift 40s ease-in-out infinite',
				'orbit': 'orbit 25s linear infinite',
				'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
				'scan-line': 'scan-line 20s ease-in-out infinite',
				'rotate-slow': 'rotate-slow 60s linear infinite',
				'data-stream': 'data-stream 15s linear infinite',
				'undulate-1': 'undulate-1 12s ease-in-out infinite',
				'undulate-2': 'undulate-2 15s ease-in-out infinite',
				'undulate-3': 'undulate-3 18s ease-in-out infinite',
				'orbit-3d': 'orbit-3d 20s linear infinite',
				'marquee': 'marquee 60s linear infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
