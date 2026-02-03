import { Button, Card } from '@mantine/core';
import './LoginForm.css';
import { JSX } from 'react';

/**
 * LoginForm component
 *
 * This component renders a login form with a button to initiate the login process.
 * It uses the Card and Button components from the @mantine/core library.
 *
 * @returns {JSX.Element} The rendered login form component.
 */
export const LoginForm = (): JSX.Element => {
	return (
		<Card shadow="sm" padding="xl" radius="md" withBorder className="ptr-LoginForm">
			<h3 className="ptr-LoginForm-title">Account Access</h3>
			<div className="ptr-LoginForm-content">
				<Button
					onClick={() => {
						const searchParams = new URLSearchParams(window.location.search);
						const returnUrl = searchParams.get('returnUrl');
						window.location.href = returnUrl
							? `/api/auth/iam?returnUrl=${encodeURIComponent(returnUrl)}`
							: '/api/auth/iam';
					}}
					className="ptr-authButton"
				>
					Login
				</Button>
				{/*<Button className="ptr-authButton" color="gray">Register</Button>*/}
			</div>
		</Card>
	);
};
