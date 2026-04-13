import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Action, Module } from '../../types';

interface PermissionGateProps {
  children: React.ReactNode;
  module: Module;
  action?: Action;
  fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({ 
  children, 
  module, 
  action = 'view', 
  fallback = null 
}) => {
  const { hasPermission } = useAuth();

  if (hasPermission(module, action)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
