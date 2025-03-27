"use client"

import { Button, Card } from "@mantine/core";
import "./LoginForm.css";
import {JSX} from "react";

/**
 * LoginForm component
 *
 * This component renders a login form with a button to initiate the login process.
 * It uses the Card and Button components from the @mantine/core library.
 *
 * @returns {JSX.Element} The rendered login form component.
 */
export const LoginForm =  (): JSX.Element => {
    
    return (
        <Card shadow="sm" padding="xl" radius="md" withBorder className="ptr-LoginForm">
            <h3 className="ptr-LoginForm-title">Account Access</h3>
            <div className="ptr-LoginForm-content">
                <Button onClick={() => window.location.href = "/api/auth/iam"} className="ptr-authButton">Login</Button>
                {/*<Button className="ptr-authButton" color="gray">Register</Button>*/}
            </div>
        </Card>
    )
}