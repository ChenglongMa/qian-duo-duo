package com.qdd.ui.addone

import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Filter
import android.widget.Filterable
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.qdd.databinding.ProjectItemBinding
import com.qdd.model.Project
import com.qdd.ui.utils.DiffCallback
import com.qdd.ui.utils.SearchFilter

// ================================================================================================
class ProjectItemAdapter(val viewModel: AddOneViewModel, private val onClick: (Project) -> Unit) :
    ListAdapter<Project, ProjectItemAdapter.ViewHolder>(DiffCallback<Project> { oldItem, newItem ->
        oldItem.name == newItem.name
    }), Filterable {
    companion object {
        const val TAG = "ProjectItemAdapter"
    }

    private lateinit var data: MutableList<Project>
    private lateinit var filteredList: MutableList<Project>
    fun initializeList(data: MutableList<Project>) {
        this.data = data
        this.filteredList = data
        this.submitList(data)
    }

    inner class ViewHolder(
        val binding: ProjectItemBinding,
        private val onClick: (Project) -> Unit
    ) :
        RecyclerView.ViewHolder(binding.root) {
        private var currentProject: Project? = null

        init {
            binding.projectCard.setOnClickListener {
                currentProject?.let {
                    onClick(it)
                }
                Log.d(TAG, "ProjectItemOnClick: clicked ${currentProject?.name}")
            }
        }

        fun bind(project: Project) {
            currentProject = project
            binding.project = project
            binding.isSelected.visibility =
                if (project.name == viewModel.projectName.value) View.VISIBLE else View.INVISIBLE
            Log.d(TAG, "ProjectItem: bind project ${project.name} ${viewModel.projectName.value}")
        }
    }

    override fun onCreateViewHolder(
        parent: ViewGroup,
        viewType: Int
    ): ProjectItemAdapter.ViewHolder = ViewHolder(
        ProjectItemBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        ), onClick
    )

    override fun onBindViewHolder(holder: ProjectItemAdapter.ViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    override fun getFilter(): Filter = SearchFilter(
        data,
        process = { item, query ->
            if (item.name.contains(query, ignoreCase = true)) item else null
        },
        publishResults = { submitList(it) })
}