// src/pages/admin/AdminDashboard.tsx - Version corrigée
import React, { useState } from "react";
import {
  Users,
  Building,
  Activity,
  TrendingUp,
  Shield,
  Stethoscope,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";

const AdminDashboard: React.FC = () => {
  const [systemStats] = useState({
    totalUsers: 10247,
    activeUsers: 8934,
    totalDoctors: 456,
    totalEstablishments: 89,
    monthlyConsultations: 1234,
    systemHealth: 98.7,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Administration CareFlow 🛠️
            </h1>
            <p className="text-gray-600 mt-1">Vue d'ensemble du système</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats système */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    Utilisateurs
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {systemStats.totalUsers.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600">
                    {systemStats.activeUsers} actifs
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Stethoscope className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    Médecins
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {systemStats.totalDoctors}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    Établissements
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {systemStats.totalEstablishments}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    Consultations/mois
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {systemStats.monthlyConsultations.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    Santé système
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {systemStats.systemHealth}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    Croissance
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">+12%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertes système */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Alertes système</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-green-800">
                  Tous les services fonctionnent normalement
                </span>
              </div>
              <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
                <span className="text-yellow-800">
                  Maintenance programmée le 15/01 à 2h00
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions rapides admin */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-medium">Gérer utilisateurs</h3>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Building className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-medium">Établissements</h3>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-medium">Analytics</h3>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Shield className="w-8 h-8 text-orange-600 mx-auto mb-3" />
              <h3 className="font-medium">Sécurité</h3>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
