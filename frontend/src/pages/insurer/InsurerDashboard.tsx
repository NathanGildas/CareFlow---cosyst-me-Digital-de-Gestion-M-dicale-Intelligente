// src/pages/insurer/InsurerDashboard.tsx - Version corrigée
import React, { useState } from "react";
import {
  Shield,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Plus,
} from "lucide-react";
import { useAuthState } from "../../hooks/AuthHooks";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const InsurerDashboard: React.FC = () => {
  const { displayName } = useAuthState();
  const [stats] = useState({
    pendingClaims: 12,
    activePolicies: 1247,
    monthlyPremiums: 2850000, // en FCFA
    reimbursements: 89,
  });

  const [recentClaims] = useState([
    {
      id: "1",
      patientName: "Fatou Sarr",
      amount: 75000,
      status: "pending",
      date: "2025-01-10",
      type: "Consultation cardiologie",
    },
    {
      id: "2",
      patientName: "Moussa Dieng",
      amount: 45000,
      status: "approved",
      date: "2025-01-09",
      type: "Consultation générale",
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bonjour {displayName} ! 🏛️
              </h1>
              <p className="text-gray-600 mt-1">
                Tableau de bord des assurances
              </p>
            </div>
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle police
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    Demandes en attente
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.pendingClaims}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    Polices actives
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.activePolicies.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    Primes mensuelles
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {(stats.monthlyPremiums / 1000000).toFixed(1)}M FCFA
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    Remboursements
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.reimbursements}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Demandes récentes */}
        <Card>
          <CardHeader>
            <CardTitle>Demandes de remboursement récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h4 className="font-semibold">{claim.patientName}</h4>
                    <p className="text-sm text-gray-600">{claim.type}</p>
                    <p className="text-sm text-gray-500">{claim.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {claim.amount.toLocaleString()} FCFA
                    </p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        claim.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {claim.status === "pending" ? "En attente" : "Approuvé"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InsurerDashboard;
