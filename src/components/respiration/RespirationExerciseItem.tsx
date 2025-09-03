// components/respiration/RespirationExerciseItem.tsx
import React from "react";
import NextLink from "next/link";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { useRouter } from "next/router";

interface RespirationExerciseItemProps {
  exercise: {
    id: number;
    label: string;
    description?: string;
    estimatedDuration?: number;
    phases?: any[];
    totalDuration: number;
    isOwner?: boolean;
  };
  onDelete?: (id: number) => void;
  onEdit?: (id: number) => void;
  isProfessional?: boolean;
}

export default function RespirationExerciseItem({ 
  exercise,
  onDelete,
  onEdit,
  isProfessional = false
}: RespirationExerciseItemProps) {
  const router = useRouter();

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getPhaseSummary = () => {
    if (!exercise.phases || exercise.phases.length === 0) return 'Aucune phase';
    return exercise.phases.map((phase: any) => phase.name).join(', ');
  };

  const handleView = () => {
    router.push(`/exercices/respiration/${exercise.id}`);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(exercise.id);
    } else {
      router.push(`/exercices/respiration/edit/${exercise.id}`);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(exercise.id);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {exercise.label}
            </h3>
            {isProfessional && (
              <span className="inline-block bg-cesizen-100 text-cesizen-800 text-xs font-medium px-2.5 py-0.5 rounded-full mb-2">
                Professionnel
              </span>
            )}
            {!isProfessional && (
              <span className="inline-block bg-cesizen-50 text-cesizen-700 text-xs font-medium px-2.5 py-0.5 rounded-full mb-2">
                Personnel
              </span>
            )}
          </div>
        </div>
        
        {exercise.description && (
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
            {exercise.description}
          </p>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            {exercise.estimatedDuration && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {exercise.estimatedDuration} min
              </span>
            )}
            {exercise.phases && exercise.phases.length > 0 && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                {exercise.phases.length} phase{exercise.phases.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleView}
            className="flex-1 bg-cesizen-600 hover:bg-cesizen-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Voir
          </button>
          {(onEdit || !isProfessional) && (
            <button
              onClick={handleEdit}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Modifier
            </button>
          )}
          {(onDelete || !isProfessional) && (
            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Supprimer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}